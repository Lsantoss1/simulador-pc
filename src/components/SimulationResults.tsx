import React, { useState } from 'react';
import type { TaxSimulationSummary } from '../types/tax';
import { formatCurrency, formatPeriodShort } from '../utils/formatters';
import { CreditCompositionBadge } from './CreditCompositionBadge';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  Edit3,
} from 'lucide-react';

interface Props {
  pisSummary: TaxSimulationSummary;
  cofinsSummary: TaxSimulationSummary;
  activeView: 'PIS' | 'COFINS' | 'CONSOLIDATED';
  onViewChange: (view: 'PIS' | 'COFINS' | 'CONSOLIDATED') => void;
  onNavigateToInputs?: () => void;
}

export const SimulationResults: React.FC<Props> = ({
  pisSummary,
  cofinsSummary,
  activeView,
  onViewChange,
  onNavigateToInputs,
}) => {
  // Estado para expandir linhas individuais da tabela
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (period: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [period]: !prev[period],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    pisSummary.resultsByMonth.forEach((r) => {
      all[r.period] = true;
    });
    setExpandedRows(all);
  };

  const collapseAll = () => {
    setExpandedRows({});
  };

  const currentSummary = activeView === 'PIS' ? pisSummary : cofinsSummary;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header com Navegação de Abas e Ações */}
      <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-800">
              Apuração Mensal & Composição dos Saldos a Transportar
            </h3>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              PEPS / FIFO Oficial
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Acompanhe o saldo credor acumulado e a <strong>origem exata (mês a mês)</strong> de cada crédito remanescente
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Seletor de Tributo */}
          <div className="flex p-1 bg-slate-200/70 rounded-xl text-xs font-semibold">
            <button
              onClick={() => onViewChange('PIS')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeView === 'PIS'
                  ? 'bg-white text-indigo-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              PIS (1,65%)
            </button>
            <button
              onClick={() => onViewChange('COFINS')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeView === 'COFINS'
                  ? 'bg-white text-emerald-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              COFINS (7,60%)
            </button>
            <button
              onClick={() => onViewChange('CONSOLIDATED')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                activeView === 'CONSOLIDATED'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Visão Consolidada
            </button>
          </div>

          {/* Atalho Expandir/Recolher Todos */}
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={expandAll}
              className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-md font-medium"
            >
              Expandir Todos
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={collapseAll}
              className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-md font-medium"
            >
              Recolher
            </button>
          </div>

          {onNavigateToInputs && (
            <button
              onClick={onNavigateToInputs}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors shadow-sm"
              title="Ir para a tela de lançamento de débitos e créditos"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
              Lançar / Editar Meses
            </button>
          )}
        </div>
      </div>

      {/* Tabela Principal */}
      <div className="overflow-x-auto">
        {activeView === 'CONSOLIDATED' ? (
          /* Tabela Consolidada (PIS + COFINS lado a lado) */
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-32">Competência</th>
                <th className="py-3 px-3 text-right bg-indigo-50/40 text-indigo-900 border-l border-indigo-100">
                  Débito PIS
                </th>
                <th className="py-3 px-3 text-right bg-indigo-50/40 text-indigo-900">
                  Crédito PIS
                </th>
                <th className="py-3 px-3 text-right bg-indigo-50/40 text-indigo-900">
                  Saldo Transp. PIS
                </th>
                <th className="py-3 px-3 text-right bg-emerald-50/40 text-emerald-900 border-l border-emerald-100">
                  Débito COFINS
                </th>
                <th className="py-3 px-3 text-right bg-emerald-50/40 text-emerald-900">
                  Crédito COFINS
                </th>
                <th className="py-3 px-3 text-right bg-emerald-50/40 text-emerald-900">
                  Saldo Transp. COFINS
                </th>
                <th className="py-3 px-4 text-right bg-slate-100 text-slate-900 border-l border-slate-200">
                  Total Saldo a Transportar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {pisSummary.resultsByMonth.map((pRes, idx) => {
                const cRes = cofinsSummary.resultsByMonth[idx] || {
                  debit: 0,
                  creditGenerated: 0,
                  balanceCarriedForward: 0,
                  taxPayable: 0,
                };
                const totalBalance = pRes.balanceCarriedForward + cRes.balanceCarriedForward;

                return (
                  <tr key={pRes.period} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {formatPeriodShort(pRes.period)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono bg-indigo-50/15 border-l border-slate-100">
                      {formatCurrency(pRes.debit)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono bg-indigo-50/15 text-emerald-700">
                      {formatCurrency(pRes.creditGenerated)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold bg-indigo-50/30 text-indigo-800">
                      {formatCurrency(pRes.balanceCarriedForward)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono bg-emerald-50/15 border-l border-slate-100">
                      {formatCurrency(cRes.debit)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono bg-emerald-50/15 text-emerald-700">
                      {formatCurrency(cRes.creditGenerated)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold bg-emerald-50/30 text-emerald-800">
                      {formatCurrency(cRes.balanceCarriedForward)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-slate-900 bg-slate-50/70 border-l border-slate-200">
                      {formatCurrency(totalBalance)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          /* Tabela Detalhada com Linhas Expansíveis para PIS ou COFINS */
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-10 text-center"></th>
                <th className="py-3 px-3 w-28">Competência</th>
                <th className="py-3 px-3 text-right">Saldo Anterior</th>
                <th className="py-3 px-3 text-right text-emerald-800">Crédito do Mês</th>
                <th className="py-3 px-3 text-right font-bold text-slate-700">Total Disponível</th>
                <th className="py-3 px-3 text-right text-slate-700">Débito do Mês</th>
                <th className="py-3 px-3 text-right text-indigo-700">Crédito Usado (PEPS)</th>
                <th className="py-3 px-3 text-right text-rose-700">Imposto a Recolher</th>
                <th className="py-3 px-4 text-right bg-indigo-50/40 text-indigo-900 border-l border-indigo-100">
                  Saldo a Transportar
                </th>
                <th className="py-3 px-4">Composição da Sobra de Crédito</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {currentSummary.resultsByMonth.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Nenhum mês para exibir. Adicione meses acima na tabela de lançamentos.
                  </td>
                </tr>
              ) : (
                currentSummary.resultsByMonth.map((res) => {
                  const isExpanded = !!expandedRows[res.period];
                  const hasRemaining = res.remainingBreakdown.length > 0;
                  const hasConsumed = res.consumedBreakdown.length > 0;

                  return (
                    <React.Fragment key={res.period}>
                      {/* Linha Principal do Mês */}
                      <tr
                        onClick={() => toggleRow(res.period)}
                        className={`cursor-pointer transition-colors ${
                          isExpanded
                            ? 'bg-indigo-50/30'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-3 px-3 text-center text-slate-400">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </td>

                        <td className="py-3 px-3 font-mono font-bold text-slate-800">
                          {formatPeriodShort(res.period)}
                        </td>

                        <td className="py-3 px-3 text-right font-mono text-slate-600">
                          {formatCurrency(res.previousBalance)}
                        </td>

                        <td className="py-3 px-3 text-right font-mono text-emerald-700 font-semibold">
                          +{formatCurrency(res.creditGenerated)}
                        </td>

                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                          {formatCurrency(res.totalAvailable)}
                        </td>

                        <td className="py-3 px-3 text-right font-mono text-slate-700">
                          {formatCurrency(res.debit)}
                        </td>

                        <td className="py-3 px-3 text-right font-mono text-indigo-700 font-semibold">
                          -{formatCurrency(res.creditConsumed)}
                        </td>

                        <td className="py-3 px-3 text-right font-mono font-bold">
                          {res.taxPayable > 0 ? (
                            <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                              {formatCurrency(res.taxPayable)}
                            </span>
                          ) : (
                            <span className="text-slate-400">R$ 0,00</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-black text-indigo-900 bg-indigo-50/20 border-l border-indigo-100">
                          {formatCurrency(res.balanceCarriedForward)}
                        </td>

                        {/* Visualização rápida da sobra */}
                        <td className="py-3 px-4">
                          {hasRemaining ? (
                            <div className="flex flex-wrap gap-1.5 items-center">
                              {res.remainingBreakdown.map((b) => (
                                <span
                                  key={b.batchId}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-slate-100 text-slate-700 border border-slate-200"
                                >
                                  <strong>{formatPeriodShort(b.originPeriod)}:</strong>
                                  <span>{formatCurrency(b.remainingAmount)}</span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">
                              Nenhum saldo restante (consumido 100%)
                            </span>
                          )}
                        </td>
                      </tr>

                      {/* Linha Expansível com Rastreamento Exato de Origem */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 border-y border-indigo-100/70">
                          <td colSpan={10} className="p-5">
                            <div className="space-y-4 max-w-5xl mx-auto">
                              {/* 1. Composição dos Créditos Restantes */}
                              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                                      Composição Exata da Sobra de Crédito ({activeView} ao fim de {formatPeriodShort(res.period)})
                                    </h4>
                                  </div>
                                  <span className="text-xs font-bold text-indigo-700">
                                    Total a Transportar: {formatCurrency(res.balanceCarriedForward)}
                                  </span>
                                </div>

                                {hasRemaining ? (
                                  <div>
                                    <p className="text-xs text-slate-600 mb-3">
                                      Do saldo credor total de <strong>{formatCurrency(res.balanceCarriedForward)}</strong>, 
                                      sobrou crédito referente aos seguintes meses de apuração:
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                      {res.remainingBreakdown.map((batch) => (
                                        <CreditCompositionBadge key={batch.batchId} batch={batch} />
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-xs text-slate-500 py-2 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    Todo o estoque de créditos foi utilizado para abater débitos. Não há saldo a transportar neste mês.
                                  </div>
                                )}
                              </div>

                              {/* 2. Memória de Abatimento PEPS (Quais meses foram consumidos) */}
                              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                                      Memória de Abatimento PEPS no Mês ({formatPeriodShort(res.period)})
                                    </h4>
                                  </div>
                                  <span className="text-xs font-bold text-slate-700">
                                    Débito do Mês: {formatCurrency(res.debit)}
                                  </span>
                                </div>

                                {hasConsumed ? (
                                  <div className="space-y-2">
                                    <p className="text-xs text-slate-600">
                                      O débito de {formatCurrency(res.debit)} foi compensado consumindo prioritariamente os créditos mais antigos:
                                    </p>
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-xs text-left">
                                        <thead>
                                          <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                                            <th className="py-2 px-3">Competência de Origem</th>
                                            <th className="py-2 px-3 text-right">Valor Consumido (R$)</th>
                                            <th className="py-2 px-3 text-center">Idade no Momento do Consumo</th>
                                            <th className="py-2 px-3">Regra Aplicada</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                          {res.consumedBreakdown.map((item, cIdx) => (
                                            <tr key={cIdx} className="hover:bg-slate-50/50">
                                              <td className="py-2 px-3 font-semibold text-slate-800">
                                                {formatPeriodShort(item.originPeriod)}
                                              </td>
                                              <td className="py-2 px-3 text-right font-mono font-bold text-indigo-700">
                                                {formatCurrency(item.amountConsumed)}
                                              </td>
                                              <td className="py-2 px-3 text-center text-slate-600">
                                                {item.monthsOldAtConsumption} {item.monthsOldAtConsumption === 1 ? 'mês decorrido' : 'meses decorridos'}
                                              </td>
                                              <td className="py-2 px-3 text-slate-500">
                                                PEPS / FIFO (consumo do lote mais antigo)
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-xs text-slate-500 py-2">
                                    {res.debit === 0 ? (
                                      'Não houve débito apurado nesta competência.'
                                    ) : (
                                      'Nenhum crédito disponível para abatimento.'
                                    )}
                                  </div>
                                )}

                                {res.taxPayable > 0 && (
                                  <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-xs text-rose-800">
                                    <div className="flex items-center gap-2">
                                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                                      <span>
                                        Os créditos disponíveis foram insuficientes para abater todo o débito de {formatCurrency(res.debit)}.
                                      </span>
                                    </div>
                                    <span className="font-bold font-mono text-sm">
                                      DARF a Pagar: {formatCurrency(res.taxPayable)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>

            {/* Totais Finais */}
            {currentSummary.resultsByMonth.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-100 font-bold text-slate-800 text-xs">
                  <td colSpan={2} className="py-3 px-4">TOTAIS ACUMULADOS</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-400">-</td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-800">
                    {formatCurrency(currentSummary.totalCreditsGenerated)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-400">-</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-800">
                    {formatCurrency(currentSummary.totalDebits)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-indigo-700">
                    {formatCurrency(currentSummary.totalCreditsConsumed)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-rose-700">
                    {formatCurrency(currentSummary.totalTaxPayable)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-black text-indigo-950 bg-indigo-100/50 border-l border-indigo-200">
                    {formatCurrency(currentSummary.currentBalanceCarriedForward)}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-normal">
                    {currentSummary.activeBatchesCount} lotes ativos no fechamento
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>
    </div>
  );
};
