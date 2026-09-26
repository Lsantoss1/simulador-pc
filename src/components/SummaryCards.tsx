import React from 'react';
import type { TaxSimulationSummary } from '../types/tax';
import { formatCurrency } from '../utils/formatters';
import { TrendingUp, TrendingDown, ArrowRightLeft, AlertTriangle, ShieldCheck } from 'lucide-react';

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

  const totalConsumed = isConsolidated
    ? pisSummary.totalCreditsConsumed + cofinsSummary.totalCreditsConsumed
    : activeView === 'PIS'
    ? pisSummary.totalCreditsConsumed
    : cofinsSummary.totalCreditsConsumed;

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Saldo a Transportar */}
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
        <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-200">
              Saldo a Transportar Atual
            </span>
            <span className="p-1.5 bg-white/10 rounded-lg">
              <ArrowRightLeft className="w-4 h-4 text-indigo-300" />
            </span>
          </div>
          <div className="text-2xl font-black mt-2 tracking-tight">
            {formatCurrency(balance)}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-indigo-700/50 flex items-center justify-between text-xs text-indigo-200">
          <span>{activeBatchesCount} {activeBatchesCount === 1 ? 'lote com sobra' : 'lotes com sobra'}</span>
          {isConsolidated ? (
            <span className="text-[11px] bg-white/15 px-2 py-0.5 rounded-full">PIS + COFINS</span>
          ) : (
            <span className="text-[11px] bg-white/15 px-2 py-0.5 rounded-full">{activeView}</span>
          )}
        </div>
      </div>

      {/* 2. Créditos Gerados */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
              Créditos Apurados
            </span>
            <span className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2">
            {formatCurrency(totalCredits)}
          </div>
        </div>
        <div className="mt-3 pt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
          <span>Créditos gerados no período</span>
        </div>
      </div>

      {/* 3. Débitos Apurados */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
              Débitos Apurados
            </span>
            <span className="p-1.5 bg-rose-50 rounded-lg text-rose-600">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2">
            {formatCurrency(totalDebits)}
          </div>
        </div>
        <div className="mt-3 pt-2 text-xs text-slate-500 flex items-center justify-between">
          <span>Consumido (PEPS):</span>
          <strong className="text-slate-700">{formatCurrency(totalConsumed)}</strong>
        </div>
      </div>

      {/* 4. Imposto a Recolher */}
      <div className={`rounded-2xl p-5 border shadow-sm flex flex-col justify-between transition-shadow ${
        totalPayable > 0 
          ? 'bg-rose-50/50 border-rose-200 hover:shadow-md' 
          : 'bg-white border-slate-200/80 hover:shadow-md'
      }`}>
        <div>
          <div className="flex items-center justify-between">
            <span className={`text-xs uppercase font-bold tracking-wider ${
              totalPayable > 0 ? 'text-rose-700' : 'text-slate-500'
            }`}>
              Imposto a Recolher
            </span>
            <span className={`p-1.5 rounded-lg ${
              totalPayable > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {totalPayable > 0 ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            </span>
          </div>
          <div className={`text-2xl font-bold mt-2 ${
            totalPayable > 0 ? 'text-rose-700' : 'text-slate-800'
          }`}>
            {formatCurrency(totalPayable)}
          </div>
        </div>
        <div className="mt-3 pt-2 text-xs text-slate-500">
          {totalPayable > 0 ? (
            <span className="text-rose-600 font-semibold">Excedeu os créditos disponíveis</span>
          ) : (
            <span className="text-emerald-600 font-medium">100% abatido com créditos</span>
          )}
        </div>
      </div>

      {/* 5. Alerta de Prescrição */}
      <div className={`rounded-2xl p-5 border shadow-sm flex flex-col justify-between transition-shadow ${
        atRiskCount > 0 
          ? 'bg-amber-50/50 border-amber-200 hover:shadow-md' 
          : 'bg-white border-slate-200/80 hover:shadow-md'
      }`}>
        <div>
          <div className="flex items-center justify-between">
            <span className={`text-xs uppercase font-bold tracking-wider ${
              atRiskCount > 0 ? 'text-amber-800' : 'text-slate-500'
            }`}>
              Prazo de 5 Anos
            </span>
            <span className={`p-1.5 rounded-lg ${
              atRiskCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className={`text-2xl font-bold mt-2 ${
            atRiskCount > 0 ? 'text-amber-700' : 'text-slate-800'
          }`}>
            {atRiskCount > 0 ? `${atRiskCount} Lotes` : 'Regular'}
          </div>
        </div>
        <div className="mt-3 pt-2 text-xs text-slate-500">
          {atRiskCount > 0 ? (
            <span className="text-amber-700 font-semibold">Lotes com mais de 36 a 48 meses</span>
          ) : (
            <span className="text-slate-500">Nenhum lote em risco de perda</span>
          )}
        </div>
      </div>
    </div>
  );
};
