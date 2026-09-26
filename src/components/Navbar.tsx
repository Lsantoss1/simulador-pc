import React from 'react';
import type { Scenario } from '../types/tax';
import type { SyncStatus } from '../services/cloudSync';
import {
  Building2,
  FileSpreadsheet,
  Printer,
  Boxes,
  Calculator,
  Cloud,
  RefreshCw,
} from 'lucide-react';

interface Props {
  scenario: Scenario;
  onOpenScenarioModal: () => void;
  onOpenInitialStockModal: () => void;
  onOpenCloudModal: () => void;
  onExportExcel: () => void;
  onPrintReport: () => void;
  syncStatus: SyncStatus;
  isCloudConfigured: boolean;
}

export const Navbar: React.FC<Props> = ({
  scenario,
  onOpenScenarioModal,
  onOpenInitialStockModal,
  onOpenCloudModal,
  onExportExcel,
  onPrintReport,
  syncStatus,
  isCloudConfigured,
}) => {
  const totalInitPIS = scenario.initialStockPIS.reduce((sum, s) => sum + s.amount, 0);
  const totalInitCOFINS = scenario.initialStockCOFINS.reduce((sum, s) => sum + s.amount, 0);
  const hasInitStock = totalInitPIS > 0 || totalInitCOFINS > 0;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo e Título */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 flex-shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Simulador PIS/COFINS
                </h1>
                <span className="hidden sm:inline-block bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                  PEPS / FIFO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Controle de Créditos a Transportar & Rastreamento da Origem das Sobras
              </p>
            </div>
          </div>

          {/* Botões Centrais e Direita */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Botão Sincronização em Nuvem */}
            <button
              onClick={onOpenCloudModal}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isCloudConfigured
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
              title="Configurar salvamento na nuvem para acessar de qualquer computador ou celular"
            >
              {syncStatus === 'syncing' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              ) : (
                <Cloud className={`w-3.5 h-3.5 ${isCloudConfigured ? 'text-emerald-600' : 'text-slate-500'}`} />
              )}
              <span className="hidden sm:inline">
                {isCloudConfigured ? 'Nuvem Conectada' : 'Nuvem'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isCloudConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                }`}
              />
            </button>

            {/* Seletor de Cenário / Empresa Ativa */}
            <button
              onClick={onOpenScenarioModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-300 bg-slate-50 hover:bg-indigo-50/40 text-left transition-all"
              title="Trocar ou criar nova empresa / cenário"
            >
              <div className="p-1 rounded-lg bg-white border border-slate-200 text-indigo-600">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="hidden md:block">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                  Empresa / Cenário
                </div>
                <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[140px]">
                  {scenario.companyName}
                </div>
              </div>
            </button>

            {/* Configurar Estoque Inicial */}
            <button
              onClick={onOpenInitialStockModal}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                hasInitStock
                  ? 'border-indigo-200 bg-indigo-50/70 text-indigo-800 hover:bg-indigo-100'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
              title="Cadastrar saldo credor acumulado de meses anteriores à simulação"
            >
              <Boxes className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Estoque Inicial</span>
              {hasInitStock && (
                <span className="w-2 h-2 rounded-full bg-indigo-600 ml-0.5" />
              )}
            </button>

            {/* Exportar Excel */}
            <button
              onClick={onExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-sm"
              title="Exportar memória de cálculo completa para Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Exportar XLSX</span>
            </button>

            {/* Imprimir / PDF */}
            <button
              onClick={onPrintReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-sm"
              title="Imprimir ou gerar PDF do relatório contábil"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden md:inline">Imprimir / PDF</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
