import React from 'react';
import type { TaxSimulationSummary } from '../types/tax';
import { formatCurrency } from '../utils/formatters';
import { ArrowRightLeft, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Props {
  pisSummary: TaxSimulationSummary;
  cofinsSummary: TaxSimulationSummary;
  activeView: 'PIS' | 'COFINS' | 'CONSOLIDATED';
}

export const SummaryCards: React.FC<Props> = ({ pisSummary, cofinsSummary, activeView }) => {
  const isConsolidated = activeView === 'CONSOLIDATED';

  const balance = isConsolidated
    ? pisSummary.currentBalanceCarriedForward + cofinsSummary.currentBalanceCarriedForward
    : activeView === 'PIS'
    ? pisSummary.currentBalanceCarriedForward
    : cofinsSummary.currentBalanceCarriedForward;

  const totalCredits = isConsolidated
    ? pisSummary.totalCreditsGenerated + cofinsSummary.totalCreditsGenerated
    : activeView === 'PIS'
    ? pisSummary.totalCreditsGenerated
    : cofinsSummary.totalCreditsGenerated;

  const totalDebits = isConsolidated
    ? pisSummary.totalDebits + cofinsSummary.totalDebits
    : activeView === 'PIS'
    ? pisSummary.totalDebits
    : cofinsSummary.totalDebits;

  const totalPayable = isConsolidated
    ? pisSummary.totalTaxPayable + cofinsSummary.totalTaxPayable
    : activeView === 'PIS'
    ? pisSummary.totalTaxPayable
    : cofinsSummary.totalTaxPayable;

  const activeBatchesCount = isConsolidated
    ? pisSummary.activeBatchesCount + cofinsSummary.activeBatchesCount
    : activeView === 'PIS'
    ? pisSummary.activeBatchesCount
    : cofinsSummary.activeBatchesCount;

  const atRiskCount = isConsolidated
    ? pisSummary.atRiskBatchesCount + cofinsSummary.atRiskBatchesCount
    : activeView === 'PIS'
    ? pisSummary.atRiskBatchesCount
    : cofinsSummary.atRiskBatchesCount;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Saldo a Transportar */}
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-200">
              Saldo a Transportar Atual
            </span>
            <span className="p-1.5 bg-white/10 rounded-lg">
              <ArrowRightLeft className="w-4 h-4 text-indigo-300" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black mt-2 font-mono tracking-tight">
            {formatCurrency(balance)}
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-indigo-700/50 flex items-center justify-between text-xs text-indigo-200">
          <span>{activeBatchesCount} {activeBatchesCount === 1 ? 'mês com sobra' : 'meses com sobra'}</span>
          <span className="text-[11px] bg-white/15 px-2 py-0.5 rounded-full font-semibold">
            {isConsolidated ? 'PIS + COFINS' : activeView}
          </span>
        </div>
      </div>

      {/* 2. Imposto a Recolher (DARF) */}
      <div className={`rounded-2xl p-5 border shadow-sm flex flex-col justify-between transition-all ${
        totalPayable > 0
          ? 'bg-rose-50/70 border-rose-300'
          : 'bg-white border-slate-200'
      }`}>
        <div>
          <div className="flex items-center justify-between">
            <span className={`text-xs uppercase font-bold tracking-wider ${
              totalPayable > 0 ? 'text-rose-800' : 'text-slate-500'
            }`}>
              Imposto a Recolher (DARF)
            </span>
            <span className={`p-1.5 rounded-lg ${
              totalPayable > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {totalPayable > 0 ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            </span>
          </div>
          <div className={`text-2xl sm:text-3xl font-bold mt-2 font-mono ${
            totalPayable > 0 ? 'text-rose-700' : 'text-slate-800'
          }`}>
            {formatCurrency(totalPayable)}
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          <span>Movimentação do período:</span>
          <span className="text-slate-700 font-medium">
            Déb: {formatCurrency(totalDebits)} | Créd: {formatCurrency(totalCredits)}
          </span>
        </div>
      </div>

      {/* 3. Alerta de Prescrição (Prazo de 5 Anos) */}
      <div className={`rounded-2xl p-5 border shadow-sm flex flex-col justify-between transition-all ${
        atRiskCount > 0
          ? 'bg-amber-50/70 border-amber-300'
          : 'bg-white border-slate-200'
      }`}>
        <div>
          <div className="flex items-center justify-between">
            <span className={`text-xs uppercase font-bold tracking-wider ${
              atRiskCount > 0 ? 'text-amber-800' : 'text-slate-500'
            }`}>
              Controle Quinquenal (5 Anos)
            </span>
            <span className={`p-1.5 rounded-lg ${
              atRiskCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-600'
            }`}>
              {atRiskCount > 0 ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            </span>
          </div>
          <div className={`text-2xl sm:text-3xl font-bold mt-2 ${
            atRiskCount > 0 ? 'text-amber-800' : 'text-emerald-700'
          }`}>
            {atRiskCount > 0 ? `${atRiskCount} Lotes em Risco` : 'Créditos Regulares'}
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-500">
          {atRiskCount > 0 ? (
            <span className="text-amber-800 font-medium">Lotes com mais de 3 anos de acúmulo</span>
          ) : (
            <span className="text-emerald-700 font-medium">Nenhum crédito próximo do limite de 60 meses</span>
          )}
        </div>
      </div>
    </div>
  );
};
