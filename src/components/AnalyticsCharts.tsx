import React from 'react';
import type { TaxSimulationSummary } from '../types/tax';
import { formatCurrency, formatPeriodShort } from '../utils/formatters';
import { TrendingUp, PieChart } from 'lucide-react';

interface Props {
  summary: TaxSimulationSummary;
}

export const AnalyticsCharts: React.FC<Props> = ({ summary }) => {
  const monthsData = summary.resultsByMonth;
  if (monthsData.length === 0) return null;

  // Encontrar valores máximos para dimensionar as barras
  const maxBalance = Math.max(...monthsData.map((d) => d.balanceCarriedForward), 1);

  // Lotes remanescentes finais para distribuição de origem
  const lastResult = monthsData[monthsData.length - 1];
  const remainingBatches = lastResult ? lastResult.remainingBreakdown : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Gráfico de Evolução do Saldo a Transportar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
              <TrendingUp className="w-4 h-4" />
            </span>
            <div>
              <h4 className="font-bold text-sm text-slate-800">
                Evolução do Saldo Credor a Transportar ({summary.taxType})
              </h4>
              <p className="text-xs text-slate-500">Mês a mês após a compensação PEPS</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md">
            Atual: {formatCurrency(summary.currentBalanceCarriedForward)}
          </span>
        </div>

        {/* Barras Horizontais / Gráfico de Linha Visual */}
        <div className="space-y-2.5 pt-2">
          {monthsData.map((d) => {
            const pct = Math.min(100, Math.round((d.balanceCarriedForward / maxBalance) * 100));
            return (
              <div key={d.period} className="flex items-center gap-3 text-xs">
                <span className="w-16 font-mono font-semibold text-slate-600 flex-shrink-0">
                  {formatPeriodShort(d.period)}
                </span>
                <div className="flex-1 bg-slate-100 rounded-full h-5 relative overflow-hidden flex items-center">
                  <div
                    style={{ width: `${Math.max(4, pct)}%` }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  />
                  <span className="absolute right-2 font-mono font-bold text-[11px] text-slate-700">
                    {formatCurrency(d.balanceCarriedForward)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Distribuição da Sobra de Crédito por Mês de Origem */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <PieChart className="w-4 h-4" />
            </span>
            <div>
              <h4 className="font-bold text-sm text-slate-800">
                Idade e Origem do Saldo Remanescente
              </h4>
              <p className="text-xs text-slate-500">
                Quanto sobrou de cada competência geradora
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-500">
            {remainingBatches.length} {remainingBatches.length === 1 ? 'mês de origem' : 'meses de origem'}
          </span>
        </div>

        {remainingBatches.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs">
            Nenhum saldo credor a transportar no momento.
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {remainingBatches.map((b) => {
              const pctOfTotal = summary.currentBalanceCarriedForward > 0
                ? Math.round((b.remainingAmount / summary.currentBalanceCarriedForward) * 100)
                : 0;

              return (
                <div key={b.batchId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800">
                        {formatPeriodShort(b.originPeriod)}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        ({b.monthsOld} meses atrás)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-slate-800">
                        {formatCurrency(b.remainingAmount)}
                      </span>
                      <span className="text-slate-400 text-[11px] w-8 text-right">
                        {pctOfTotal}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      style={{ width: `${pctOfTotal}%` }}
                      className={`h-full rounded-full ${
                        b.status === 'critical'
                          ? 'bg-amber-500'
                          : b.status === 'prescribed'
                          ? 'bg-red-500'
                          : b.status === 'warning'
                          ? 'bg-yellow-400'
                          : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
