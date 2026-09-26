import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { InitialCreditStock, MonthlyInput, Scenario } from './types/tax';
import { runTaxSimulation } from './domain/creditEngine';
import {
  loadScenarios,
  saveScenarios,
  getActiveScenarioId,
  setActiveScenarioId,
  createDefaultScenario,
} from './utils/storage';
import { exportSimulationToExcel, downloadImportTemplate } from './utils/excelExport';
import { formatCurrency, formatPeriodShort } from './utils/formatters';
import { isCloudConfigured } from './services/supabase';
import {
  fetchScenariosFromCloud,
  pushScenarioToCloud,
  pushAllScenariosToCloud,
  deleteScenarioFromCloud,
} from './services/cloudSync';
import type { SyncStatus } from './services/cloudSync';

// Componentes
import { Navbar } from './components/Navbar';
import { SummaryCards } from './components/SummaryCards';
import { MonthlyInputTable } from './components/MonthlyInputTable';
import { SimulationResults } from './components/SimulationResults';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { InitialStockModal } from './components/InitialStockModal';
import { ScenarioModal } from './components/ScenarioModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { LegalInfoModal } from './components/LegalInfoModal';
import { PrintReportView } from './components/PrintReportView';

import {
  Building2,
  FileCheck2,
  Cloud,
  Table,
  Edit3,
  BarChart3,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

export const App: React.FC = () => {
  // Estado de Cenários e Persistência Local
  const [scenarios, setScenarios] = useState<Scenario[]>(() => loadScenarios());
  const [activeScenarioIdState, setActiveScenarioIdState] = useState<string>(() =>
    getActiveScenarioId()
  );

  // Aba Principal Ativa (Apuração, Lançamentos ou Gráficos)
  const [activeTab, setActiveTab] = useState<'apuracao' | 'lancamentos' | 'graficos'>('apuracao');

  // Visão Ativa de Tributos (PIS, COFINS ou Consolidado)
  const [activeView, setActiveView] = useState<'PIS' | 'COFINS' | 'CONSOLIDATED'>('PIS');

  // Controle de Modais
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [isInitialStockModalOpen, setIsInitialStockModalOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);

  // Estado de Sincronização em Nuvem
  const [cloudActive, setCloudActive] = useState<boolean>(() => isCloudConfigured());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() =>
    isCloudConfigured() ? 'synced' : 'offline'
  );
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Cenário Ativo
  const activeScenario = useMemo(() => {
    return scenarios.find((s) => s.id === activeScenarioIdState) || scenarios[0] || createDefaultScenario();
  }, [scenarios, activeScenarioIdState]);

  // Salvar automaticamente sempre no localStorage
  useEffect(() => {
    saveScenarios(scenarios);
  }, [scenarios]);

  // Salvar id do cenário ativo
  useEffect(() => {
    setActiveScenarioId(activeScenario.id);
  }, [activeScenario.id]);

  // Carregar dados da nuvem na inicialização (se configurado)
  useEffect(() => {
    if (isCloudConfigured()) {
      setSyncStatus('syncing');
      fetchScenariosFromCloud().then((cloudScenarios) => {
        if (cloudScenarios && cloudScenarios.length > 0) {
          setScenarios(cloudScenarios);
          setActiveScenarioIdState(cloudScenarios[0].id);
          setLastSyncedAt(new Date());
          setSyncStatus('synced');
        } else if (cloudScenarios && cloudScenarios.length === 0) {
          pushAllScenariosToCloud(scenarios).then(() => {
            setLastSyncedAt(new Date());
            setSyncStatus('synced');
          });
        } else {
          setSyncStatus('error');
        }
      });
    }
  }, []);

  // Sincronização manual acionada pelo usuário
  const handleManualSync = useCallback(async () => {
    setSyncStatus('syncing');
    try {
      const cloudData = await fetchScenariosFromCloud();
      if (cloudData && cloudData.length > 0) {
        setScenarios(cloudData);
        setLastSyncedAt(new Date());
        setSyncStatus('synced');
      } else {
        const ok = await pushAllScenariosToCloud(scenarios);
        if (ok) {
          setLastSyncedAt(new Date());
          setSyncStatus('synced');
        } else {
          setSyncStatus('error');
        }
      }
    } catch {
      setSyncStatus('error');
    }
  }, [scenarios]);

  // Sincronização automática para alterações locais
  const triggerCloudPush = useCallback((updatedScenario: Scenario) => {
    if (isCloudConfigured()) {
      setSyncStatus('syncing');
      pushScenarioToCloud(updatedScenario).then((success) => {
        if (success) {
          setLastSyncedAt(new Date());
          setSyncStatus('synced');
        } else {
          setSyncStatus('error');
        }
      });
    }
  }, []);

  // Execução do Motor Contábil PEPS para PIS e COFINS
  const pisSummary = useMemo(() => {
    return runTaxSimulation('PIS', activeScenario.initialStockPIS, activeScenario.months);
  }, [activeScenario.initialStockPIS, activeScenario.months]);

  const cofinsSummary = useMemo(() => {
    return runTaxSimulation('COFINS', activeScenario.initialStockCOFINS, activeScenario.months);
  }, [activeScenario.initialStockCOFINS, activeScenario.months]);

  // Handlers para Atualizar o Cenário Ativo
  const handleUpdateMonths = (newMonths: MonthlyInput[]) => {
    const updated: Scenario = {
      ...activeScenario,
      months: newMonths,
      updatedAt: new Date().toISOString(),
    };

    setScenarios((prev) =>
      prev.map((scn) => (scn.id === activeScenario.id ? updated : scn))
    );

    triggerCloudPush(updated);
  };

  const handleUpdateInitialStocks = (
    pis: InitialCreditStock[],
    cofins: InitialCreditStock[]
  ) => {
    const updated: Scenario = {
      ...activeScenario,
      initialStockPIS: pis,
      initialStockCOFINS: cofins,
      updatedAt: new Date().toISOString(),
    };

    setScenarios((prev) =>
      prev.map((scn) => (scn.id === activeScenario.id ? updated : scn))
    );

    triggerCloudPush(updated);
  };

  const handleCreateScenario = (name: string, companyName: string, cnpj?: string) => {
    const newScn: Scenario = {
      id: `scn-${Date.now()}`,
      name,
      companyName,
      cnpj,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      initialStockPIS: [],
      initialStockCOFINS: [],
      months: [],
    };
    setScenarios((prev) => [...prev, newScn]);
    setActiveScenarioIdState(newScn.id);
    triggerCloudPush(newScn);
  };

  const handleDuplicateScenario = (id: string) => {
    const target = scenarios.find((s) => s.id === id);
    if (!target) return;

    const dup: Scenario = {
      ...JSON.parse(JSON.stringify(target)),
      id: `scn-${Date.now()}`,
      name: `${target.name} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setScenarios((prev) => [...prev, dup]);
    setActiveScenarioIdState(dup.id);
    triggerCloudPush(dup);
  };

  const handleDeleteScenario = (id: string) => {
    if (scenarios.length <= 1) {
      alert('Não é possível excluir o único cenário existente.');
      return;
    }
    if (window.confirm('Confirma a exclusão deste cenário?')) {
      const remaining = scenarios.filter((s) => s.id !== id);
      setScenarios(remaining);
      setActiveScenarioIdState(remaining[0].id);
      deleteScenarioFromCloud(id);
    }
  };

  const handleUpdateScenarioDetails = (
    id: string,
    name: string,
    companyName: string,
    cnpj?: string
  ) => {
    const target = scenarios.find((s) => s.id === id);
    if (!target) return;

    const updated: Scenario = {
      ...target,
      name,
      companyName,
      cnpj,
      updatedAt: new Date().toISOString(),
    };

    setScenarios((prev) =>
      prev.map((scn) => (scn.id === id ? updated : scn))
    );

    triggerCloudPush(updated);
  };

  // Exportação Excel
  const handleExportExcel = () => {
    exportSimulationToExcel(activeScenario, pisSummary, cofinsSummary);
  };

  // Impressão / PDF
  const handlePrint = () => {
    window.print();
  };

  // Último resultado apurado para síntese executiva
  const lastPIS = pisSummary.resultsByMonth[pisSummary.resultsByMonth.length - 1];
  const lastCOFINS = cofinsSummary.resultsByMonth[cofinsSummary.resultsByMonth.length - 1];
  const totalBalanceNow = pisSummary.currentBalanceCarriedForward + cofinsSummary.currentBalanceCarriedForward;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 1. Barra de Navegação Superior */}
      <Navbar
        scenario={activeScenario}
        onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
        onOpenInitialStockModal={() => setIsInitialStockModalOpen(true)}
        onOpenCloudModal={() => {
          setIsCloudModalOpen(true);
          setCloudActive(isCloudConfigured());
        }}
        onExportExcel={handleExportExcel}
        onPrintReport={handlePrint}
        syncStatus={syncStatus}
        isCloudConfigured={cloudActive}
      />

      {/* Conteúdo Principal (Oculto na impressão) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5 no-print">
        {/* Subheader Compacto & Elegante */}
        <div className="bg-white rounded-2xl border border-slate-200/80 px-5 py-3.5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
              <Building2 className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800">
                  {activeScenario.companyName}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  • {activeScenario.name}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <span>{activeScenario.months.length} meses apurados</span>
                {cloudActive && (
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    • <Cloud className="w-3 h-3" /> Nuvem Ativa
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Saldo a Transportar Total
              </div>
              <div className="text-base font-extrabold text-indigo-900 font-mono">
                {formatCurrency(totalBalanceNow)}
              </div>
            </div>

            <button
              onClick={() => setIsLegalModalOpen(true)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors text-xs flex items-center gap-1"
              title="Informações e regras legais da EFD-Contribuições"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden md:inline">Regras Fiscais</span>
            </button>
          </div>
        </div>

        {/* 2. Seletor Dinâmico de Abas (Limpo e Focado) */}
        <div className="flex border-b border-slate-200/80 gap-2 bg-slate-100/70 p-1 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('apuracao')}
            className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'apuracao'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Table className="w-4 h-4 text-indigo-600" />
            <span>Apuração & Sobras de Crédito</span>
          </button>

          <button
            onClick={() => setActiveTab('lancamentos')}
            className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'lancamentos'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Edit3 className="w-4 h-4 text-slate-500" />
            <span>Lançamentos Mensais</span>
            <span className="bg-slate-200/80 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
              {activeScenario.months.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('graficos')}
            className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'graficos'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-slate-500" />
            <span>Gráficos & Idade</span>
          </button>
        </div>

        {/* 3. CONTEÚDO DA ABA 1: APURAÇÃO & SOBRAS (Visão Executiva) */}
        {activeTab === 'apuracao' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* KPIs Essenciais (3 Cards Diretos) */}
            <SummaryCards
              pisSummary={pisSummary}
              cofinsSummary={cofinsSummary}
              activeView={activeView}
            />

            {/* Destaque Central: De quais meses são as sobras de crédito? */}
            {((activeView === 'PIS' && lastPIS && lastPIS.remainingBreakdown.length > 0) ||
              (activeView === 'COFINS' && lastCOFINS && lastCOFINS.remainingBreakdown.length > 0) ||
              (activeView === 'CONSOLIDATED' && ((lastPIS && lastPIS.remainingBreakdown.length > 0) || (lastCOFINS && lastCOFINS.remainingBreakdown.length > 0)))) && (
              <div className="bg-white border border-indigo-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 flex-shrink-0">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      Origem dos Créditos Restantes a Transportar
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Montante que sobrou da compensação PEPS e de qual mês ele foi gerado:
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(activeView === 'PIS' || activeView === 'CONSOLIDATED') && lastPIS && (
                    lastPIS.remainingBreakdown.map((b) => (
                      <div
                        key={`highlight-pis-${b.batchId}`}
                        className="bg-indigo-50/60 border border-indigo-200/80 rounded-xl px-2.5 py-1 text-xs flex items-center gap-1.5"
                      >
                        <span className="font-bold text-indigo-900 text-[10px]">PIS</span>
                        <span className="text-slate-600 font-medium">
                          {formatPeriodShort(b.originPeriod)}:
                        </span>
                        <strong className="text-indigo-900 font-mono">
                          {formatCurrency(b.remainingAmount)}
                        </strong>
                      </div>
                    ))
                  )}

                  {(activeView === 'COFINS' || activeView === 'CONSOLIDATED') && lastCOFINS && (
                    lastCOFINS.remainingBreakdown.map((b) => (
                      <div
                        key={`highlight-cofins-${b.batchId}`}
                        className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl px-2.5 py-1 text-xs flex items-center gap-1.5"
                      >
                        <span className="font-bold text-emerald-900 text-[10px]">COFINS</span>
                        <span className="text-slate-600 font-medium">
                          {formatPeriodShort(b.originPeriod)}:
                        </span>
                        <strong className="text-emerald-900 font-mono">
                          {formatCurrency(b.remainingAmount)}
                        </strong>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tabela de Apuração com Expansão Sob Demanda */}
            <SimulationResults
              pisSummary={pisSummary}
              cofinsSummary={cofinsSummary}
              activeView={activeView}
              onViewChange={setActiveView}
              onNavigateToInputs={() => setActiveTab('lancamentos')}
            />
          </div>
        )}

        {/* 4. CONTEÚDO DA ABA 2: LANÇAMENTOS MENSAIS */}
        {activeTab === 'lancamentos' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between bg-indigo-50/60 border border-indigo-100 rounded-2xl px-5 py-3 text-xs text-indigo-950">
              <span>
                Preencha os valores apurados de cada competência. Eles alimentarão a regra PEPS na aba de Apuração.
              </span>
              <button
                onClick={() => setActiveTab('apuracao')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-xs"
              >
                <span>Ver Apuração & Sobras</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <MonthlyInputTable
              months={activeScenario.months}
              onChange={handleUpdateMonths}
              onDownloadTemplate={downloadImportTemplate}
            />
          </div>
        )}

        {/* 5. CONTEÚDO DA ABA 3: GRÁFICOS ANALÍTICOS */}
        {activeTab === 'graficos' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <AnalyticsCharts
              summary={activeView === 'COFINS' ? cofinsSummary : pisSummary}
            />
          </div>
        )}
      </main>

      {/* Relatório Oficial para Impressão / PDF */}
      <PrintReportView
        scenario={activeScenario}
        pisSummary={pisSummary}
        cofinsSummary={cofinsSummary}
      />

      {/* Modais */}
      <InitialStockModal
        isOpen={isInitialStockModalOpen}
        onClose={() => setIsInitialStockModalOpen(false)}
        initialStockPIS={activeScenario.initialStockPIS}
        initialStockCOFINS={activeScenario.initialStockCOFINS}
        onSave={handleUpdateInitialStocks}
      />

      <ScenarioModal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        scenarios={scenarios}
        activeScenarioId={activeScenario.id}
        onSelectScenario={setActiveScenarioIdState}
        onCreateScenario={handleCreateScenario}
        onDuplicateScenario={handleDuplicateScenario}
        onDeleteScenario={handleDeleteScenario}
        onUpdateScenarioDetails={handleUpdateScenarioDetails}
      />

      <CloudSyncModal
        isOpen={isCloudModalOpen}
        onClose={() => {
          setIsCloudModalOpen(false);
          setCloudActive(isCloudConfigured());
        }}
        onManualSync={handleManualSync}
        isSyncing={syncStatus === 'syncing'}
        lastSyncedAt={lastSyncedAt}
      />

      <LegalInfoModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
      />
    </div>
  );
};

export default App;
