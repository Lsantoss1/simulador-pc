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
import { PrintReportView } from './components/PrintReportView';

import {
  Building2,
  FileCheck2,
  Cloud,
} from 'lucide-react';

export const App: React.FC = () => {
  // Estado de Cenários e Persistência Local
  const [scenarios, setScenarios] = useState<Scenario[]>(() => loadScenarios());
  const [activeScenarioIdState, setActiveScenarioIdState] = useState<string>(() =>
    getActiveScenarioId()
  );

  // Visão Ativa de Tributos (PIS, COFINS ou Consolidado)
  const [activeView, setActiveView] = useState<'PIS' | 'COFINS' | 'CONSOLIDATED'>('PIS');

  // Controle de Modais
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [isInitialStockModalOpen, setIsInitialStockModalOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);

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
          // Atualiza lista com dados da nuvem
          setScenarios(cloudScenarios);
          setActiveScenarioIdState(cloudScenarios[0].id);
          setLastSyncedAt(new Date());
          setSyncStatus('synced');
        } else if (cloudScenarios && cloudScenarios.length === 0) {
          // Nuvem vazia: envia os cenários locais atuais para a nuvem
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
        // Envia dados locais atuais
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

  // Sincronização automática para alterações locais (debounced)
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

      {/* Conteúdo Principal Interativo (Oculto na impressão) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 no-print">
        {/* Banner do Cenário & Síntese Rápida */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-indigo-50 text-indigo-700">
                <Building2 className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                {activeScenario.companyName}
              </h2>
              {activeScenario.cnpj && (
                <span className="text-xs text-slate-500 font-mono">
                  (CNPJ: {activeScenario.cnpj})
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
              <span>Cenário: <strong className="text-slate-700">{activeScenario.name}</strong></span>
              <span>•</span>
              <span>{activeScenario.months.length} competências apuradas</span>
              <span>•</span>
              <span className="text-indigo-600 font-medium">Regra PEPS / FIFO ativa</span>
              {cloudActive && (
                <>
                  <span>•</span>
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <Cloud className="w-3.5 h-3.5" />
                    Sincronizado na Nuvem
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Destaque do Saldo Atual */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-3">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                Saldo a Transportar Consolidado
              </div>
              <div className="text-lg font-black text-indigo-900 font-mono">
                {formatCurrency(totalBalanceNow)}
              </div>
            </div>
            <div className="border-l border-slate-200 pl-3 text-xs text-slate-600 space-y-0.5">
              <div>PIS: <strong className="font-mono text-indigo-700">{formatCurrency(pisSummary.currentBalanceCarriedForward)}</strong></div>
              <div>COFINS: <strong className="font-mono text-emerald-700">{formatCurrency(cofinsSummary.currentBalanceCarriedForward)}</strong></div>
            </div>
          </div>
        </div>

        {/* 2. Cards de KPIs e Métricas Resumo */}
        <SummaryCards
          pisSummary={pisSummary}
          cofinsSummary={cofinsSummary}
          activeView={activeView}
        />

        {/* 3. Destaque Específico da Pergunta do Usuário: "Sobrou crédito referente a algum mês e quanto foi?" */}
        {((activeView === 'PIS' && lastPIS && lastPIS.remainingBreakdown.length > 0) ||
          (activeView === 'COFINS' && lastCOFINS && lastCOFINS.remainingBreakdown.length > 0) ||
          (activeView === 'CONSOLIDATED' && ((lastPIS && lastPIS.remainingBreakdown.length > 0) || (lastCOFINS && lastCOFINS.remainingBreakdown.length > 0)))) && (
          <div className="bg-gradient-to-r from-indigo-50 via-white to-emerald-50 border border-indigo-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-600 text-white flex-shrink-0 shadow-sm">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    Rastreamento de Sobras: De quais meses são os créditos a transportar?
                  </h3>
                  <span className="text-xs font-semibold text-indigo-700">
                    Posição na última competência ({activeScenario.months[activeScenario.months.length - 1]?.period})
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Pela regra contábil PEPS (Primeiro que Entra, Primeiro que Sai), os créditos mais antigos foram consumidos primeiro pelos débitos apurados. 
                  Ao término da simulação, os créditos remanescentes a transportar pertencem aos seguintes períodos de apuração:
                </p>

                {/* Tags de Origem */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {(activeView === 'PIS' || activeView === 'CONSOLIDATED') && lastPIS && (
                    lastPIS.remainingBreakdown.map((b) => (
                      <div
                        key={`highlight-pis-${b.batchId}`}
                        className="bg-white border border-indigo-200 rounded-xl px-3 py-1.5 shadow-sm flex items-center gap-2 text-xs"
                      >
                        <span className="font-bold text-indigo-900 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px]">
                          PIS
                        </span>
                        <span className="font-semibold text-slate-700">
                          Origem {formatPeriodShort(b.originPeriod)}:
                        </span>
                        <strong className="text-indigo-700 font-mono">
                          {formatCurrency(b.remainingAmount)}
                        </strong>
                        <span className="text-[10px] text-slate-400">
                          (idade: {b.monthsOld}m)
                        </span>
                      </div>
                    ))
                  )}

                  {(activeView === 'COFINS' || activeView === 'CONSOLIDATED') && lastCOFINS && (
                    lastCOFINS.remainingBreakdown.map((b) => (
                      <div
                        key={`highlight-cofins-${b.batchId}`}
                        className="bg-white border border-emerald-200 rounded-xl px-3 py-1.5 shadow-sm flex items-center gap-2 text-xs"
                      >
                        <span className="font-bold text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                          COFINS
                        </span>
                        <span className="font-semibold text-slate-700">
                          Origem {formatPeriodShort(b.originPeriod)}:
                        </span>
                        <strong className="text-emerald-700 font-mono">
                          {formatCurrency(b.remainingAmount)}
                        </strong>
                        <span className="text-[10px] text-slate-400">
                          (idade: {b.monthsOld}m)
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Tabela de Lançamentos Mensais (Entrada de Débitos e Créditos) */}
        <MonthlyInputTable
          months={activeScenario.months}
          onChange={handleUpdateMonths}
          onDownloadTemplate={downloadImportTemplate}
        />

        {/* 5. Tabela de Apuração e Memória de Cálculo PEPS com Sobras por Mês */}
        <SimulationResults
          pisSummary={pisSummary}
          cofinsSummary={cofinsSummary}
          activeView={activeView}
          onViewChange={setActiveView}
        />

        {/* 6. Gráficos Analíticos de Evolução e Idade dos Créditos */}
        <AnalyticsCharts
          summary={activeView === 'COFINS' ? cofinsSummary : pisSummary}
        />

        {/* Guia Rápido Fiscal no Rodapé */}
        <div className="bg-slate-100/80 border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-600 flex items-start gap-3">
          <div className="space-y-1">
            <div className="font-bold text-slate-800">
              Sobre as Regras da EFD-Contribuições e Legislação Não-Cumulativa
            </div>
            <p>
              O controle de créditos a descontar de períodos anteriores (Blocos 1100 para PIS e 1500 para COFINS) adota o critério 
              <strong> PEPS / FIFO</strong>. Os créditos decorrentes de apurações passadas não aproveitados prescrevem no prazo de <strong>5 anos (60 meses)</strong>, 
              conforme o Decreto nº 20.910/1932 e normativas da Receita Federal do Brasil. Este simulador mantém a segregação por lote e competência original 
              para total conformidade com a escrituração fiscal digital.
            </p>
          </div>
        </div>
      </main>

      {/* 7. Relatório Oficial Formatado para Impressão / PDF */}
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
    </div>
  );
};

export default App;
