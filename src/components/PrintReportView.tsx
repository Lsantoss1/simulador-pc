import React from 'react';
import type { Scenario, TaxSimulationSummary } from '../types/tax';
import { formatCurrency, formatPeriodShort, getStatusLabel } from '../utils/formatters';

interface Props {
  scenario: Scenario;
  pisSummary: TaxSimulationSummary;
  cofinsSummary: TaxSimulationSummary;
}

export const PrintReportView: React.FC<Props> = ({
  scenario,
  pisSummary,
  cofinsSummary,
}) => {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="hidden print:block p-8 bg-white text-black font-sans leading-tight text-xs">
      {/* Cabeçalho do Laudo */}
      <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight">
            Relatório de Controle de Créditos a Transportar
          </h1>
          <h2 className="text-sm font-bold text-gray-700 mt-1">
            Apuração Não-Cumulativa de PIS e COFINS (Método PEPS / FIFO)
          </h2>
          <div className="mt-2 text-xs text-gray-600">
            <strong>Empresa:</strong> {scenario.companyName} |{' '}
            <strong>CNPJ:</strong> {scenario.cnpj || 'Não informado'} |{' '}
            <strong>Cenário:</strong> {scenario.name}
          </div>
        </div>
        <div className="text-right text-[11px] text-gray-500">
          <div>Emissão: {currentDate}</div>
          <div>Fundamento: EFD-Contribuições (Blocos 1100 / 1500)</div>
        </div>
      </div>

      {/* Resumo Consolidado */}
      <div className="mb-6">
        <h3 className="font-bold text-xs uppercase tracking-wider mb-2 border-b border-gray-300 pb-1">
          1. Quadro Resumo dos Saldos e Apurações
        </h3>
        <table className="w-full border-collapse border border-gray-300 text-left text-[11px]">
          <thead>
            <tr className="bg-gray-100 font-bold border-b border-gray-300">
              <th className="p-2 border-r border-gray-300">Tributo</th>
              <th className="p-2 border-r border-gray-300 text-right">Débitos Totais</th>
              <th className="p-2 border-r border-gray-300 text-right">Créditos Gerados</th>
              <th className="p-2 border-r border-gray-300 text-right">Créditos Consumidos (PEPS)</th>
              <th className="p-2 border-r border-gray-300 text-right">Imposto a Recolher</th>
              <th className="p-2 text-right bg-gray-200">Saldo a Transportar</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-300">
              <td className="p-2 font-bold border-r border-gray-300">PIS (1,65%)</td>
              <td className="p-2 text-right border-r border-gray-300">{formatCurrency(pisSummary.totalDebits)}</td>
              <td className="p-2 text-right border-r border-gray-300">{formatCurrency(pisSummary.totalCreditsGenerated)}</td>
              <td className="p-2 text-right border-r border-gray-300">{formatCurrency(pisSummary.totalCreditsConsumed)}</td>
              <td className="p-2 text-right border-r border-gray-300">{formatCurrency(pisSummary.totalTaxPayable)}</td>
              <td className="p-2 text-right font-bold bg-gray-50">{formatCurrency(pisSummary.currentBalanceCarriedForward)}</td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="p-2 font-bold border-r border-gray-300">COFINS (7,60%)</td>
              <td className="p-2 text-right border-r border-gray-300">{formatCurrency(cofinsSummary.totalDebits)}</td>
              <td className="p-2 text-right border-r border-gray-300">{formatCurrency(cofinsSummary.totalCreditsGenerated)}</td>
              <td className="p-2 text-right border-r border-gray-300">{formatCurrency(cofinsSummary.totalCreditsConsumed)}</td>
              <td className="p-2 text-right border-r border-gray-300">{formatCurrency(cofinsSummary.totalTaxPayable)}</td>
              <td className="p-2 text-right font-bold bg-gray-50">{formatCurrency(cofinsSummary.currentBalanceCarriedForward)}</td>
            </tr>
            <tr className="bg-gray-100 font-bold">
              <td className="p-2 border-r border-gray-300">TOTAL CONSOLIDADO</td>
              <td className="p-2 text-right border-r border-gray-300">{formatCurrency(pisSummary.totalDebits + cofinsSummary.totalDebits)}</td>
              <td className="p-2 text-right border-r border-gray-300">{formatCurrency(pisSummary.totalCreditsGenerated + cofinsSummary.totalCreditsGenerated)}</td>
              <td className="p-2 text-right border-r border-gray-300">{formatCurrency(pisSummary.totalCreditsConsumed + cofinsSummary.totalCreditsConsumed)}</td>
              <td className="p-2 text-right border-r border-gray-300">{formatCurrency(pisSummary.totalTaxPayable + cofinsSummary.totalTaxPayable)}</td>
              <td className="p-2 text-right bg-gray-200">{formatCurrency(pisSummary.currentBalanceCarriedForward + cofinsSummary.currentBalanceCarriedForward)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tabela de Memória PIS */}
      <div className="mb-6 page-break">
        <h3 className="font-bold text-xs uppercase tracking-wider mb-2 border-b border-gray-300 pb-1">
          2. Demonstrativo Mensal - PIS (1,65%)
        </h3>
        <table className="w-full border-collapse border border-gray-300 text-left text-[10px]">
          <thead>
            <tr className="bg-gray-100 font-bold border-b border-gray-300">
              <th className="p-1.5 border-r border-gray-300">Mês</th>
              <th className="p-1.5 border-r border-gray-300 text-right">Saldo Anterior</th>
              <th className="p-1.5 border-r border-gray-300 text-right">Crédito Gerado</th>
              <th className="p-1.5 border-r border-gray-300 text-right">Débito do Mês</th>
              <th className="p-1.5 border-r border-gray-300 text-right">Crédito Consumido</th>
              <th className="p-1.5 border-r border-gray-300 text-right">Imposto a Recolher</th>
              <th className="p-1.5 border-r border-gray-300 text-right bg-gray-50">Saldo a Transportar</th>
              <th className="p-1.5">Composição das Sobras (Mês de Origem: R$)</th>
            </tr>
          </thead>
          <tbody>
            {pisSummary.resultsByMonth.map((r) => (
              <tr key={r.period} className="border-b border-gray-200">
                <td className="p-1.5 font-bold border-r border-gray-200">{formatPeriodShort(r.period)}</td>
                <td className="p-1.5 text-right border-r border-gray-200">{formatCurrency(r.previousBalance)}</td>
                <td className="p-1.5 text-right border-r border-gray-200">{formatCurrency(r.creditGenerated)}</td>
                <td className="p-1.5 text-right border-r border-gray-200">{formatCurrency(r.debit)}</td>
                <td className="p-1.5 text-right border-r border-gray-200">{formatCurrency(r.creditConsumed)}</td>
                <td className="p-1.5 text-right border-r border-gray-200">{formatCurrency(r.taxPayable)}</td>
                <td className="p-1.5 text-right font-bold border-r border-gray-200 bg-gray-50">{formatCurrency(r.balanceCarriedForward)}</td>
                <td className="p-1.5 text-[9px] text-gray-700">
                  {r.remainingBreakdown
                    .map((b) => `${formatPeriodShort(b.originPeriod)}: ${formatCurrency(b.remainingAmount)}`)
                    .join(' | ') || 'Sem sobras'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tabela de Memória COFINS */}
      <div className="mb-6 page-break">
        <h3 className="font-bold text-xs uppercase tracking-wider mb-2 border-b border-gray-300 pb-1">
          3. Demonstrativo Mensal - COFINS (7,60%)
        </h3>
        <table className="w-full border-collapse border border-gray-300 text-left text-[10px]">
          <thead>
            <tr className="bg-gray-100 font-bold border-b border-gray-300">
              <th className="p-1.5 border-r border-gray-300">Mês</th>
              <th className="p-1.5 border-r border-gray-300 text-right">Saldo Anterior</th>
              <th className="p-1.5 border-r border-gray-300 text-right">Crédito Gerado</th>
              <th className="p-1.5 border-r border-gray-300 text-right">Débito do Mês</th>
              <th className="p-1.5 border-r border-gray-300 text-right">Crédito Consumido</th>
              <th className="p-1.5 border-r border-gray-300 text-right">Imposto a Recolher</th>
              <th className="p-1.5 border-r border-gray-300 text-right bg-gray-50">Saldo a Transportar</th>
              <th className="p-1.5">Composição das Sobras (Mês de Origem: R$)</th>
            </tr>
          </thead>
          <tbody>
            {cofinsSummary.resultsByMonth.map((r) => (
              <tr key={r.period} className="border-b border-gray-200">
                <td className="p-1.5 font-bold border-r border-gray-200">{formatPeriodShort(r.period)}</td>
                <td className="p-1.5 text-right border-r border-gray-200">{formatCurrency(r.previousBalance)}</td>
                <td className="p-1.5 text-right border-r border-gray-200">{formatCurrency(r.creditGenerated)}</td>
                <td className="p-1.5 text-right border-r border-gray-200">{formatCurrency(r.debit)}</td>
                <td className="p-1.5 text-right border-r border-gray-200">{formatCurrency(r.creditConsumed)}</td>
                <td className="p-1.5 text-right border-r border-gray-200">{formatCurrency(r.taxPayable)}</td>
                <td className="p-1.5 text-right font-bold border-r border-gray-200 bg-gray-50">{formatCurrency(r.balanceCarriedForward)}</td>
                <td className="p-1.5 text-[9px] text-gray-700">
                  {r.remainingBreakdown
                    .map((b) => `${formatPeriodShort(b.originPeriod)}: ${formatCurrency(b.remainingAmount)}`)
                    .join(' | ') || 'Sem sobras'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rastreabilidade Final da Sobra */}
      <div className="mb-6">
        <h3 className="font-bold text-xs uppercase tracking-wider mb-2 border-b border-gray-300 pb-1">
          4. Inventário Final de Lotes de Crédito Restantes por Mês de Origem
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {/* PIS */}
          <div>
            <h4 className="font-bold text-[11px] mb-1">Lotes Restantes de PIS</h4>
            <table className="w-full border border-gray-300 text-[10px]">
              <thead className="bg-gray-100 font-bold border-b border-gray-300">
                <tr>
                  <th className="p-1 border-r border-gray-300">Origem</th>
                  <th className="p-1 border-r border-gray-300 text-right">Valor Original</th>
                  <th className="p-1 border-r border-gray-300 text-right">Saldo Restante</th>
                  <th className="p-1 text-center">Status (Idade)</th>
                </tr>
              </thead>
              <tbody>
                {pisSummary.resultsByMonth[pisSummary.resultsByMonth.length - 1]?.remainingBreakdown.map((b) => (
                  <tr key={b.batchId} className="border-b border-gray-200">
                    <td className="p-1 font-bold border-r border-gray-200">{formatPeriodShort(b.originPeriod)}</td>
                    <td className="p-1 text-right border-r border-gray-200">{formatCurrency(b.originalAmount)}</td>
                    <td className="p-1 text-right font-bold border-r border-gray-200">{formatCurrency(b.remainingAmount)}</td>
                    <td className="p-1 text-center">{getStatusLabel(b.status, b.monthsOld).label}</td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={4} className="p-2 text-center text-gray-500">Nenhum lote ativo</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* COFINS */}
          <div>
            <h4 className="font-bold text-[11px] mb-1">Lotes Restantes de COFINS</h4>
            <table className="w-full border border-gray-300 text-[10px]">
              <thead className="bg-gray-100 font-bold border-b border-gray-300">
                <tr>
                  <th className="p-1 border-r border-gray-300">Origem</th>
                  <th className="p-1 border-r border-gray-300 text-right">Valor Original</th>
                  <th className="p-1 border-r border-gray-300 text-right">Saldo Restante</th>
                  <th className="p-1 text-center">Status (Idade)</th>
                </tr>
              </thead>
              <tbody>
                {cofinsSummary.resultsByMonth[cofinsSummary.resultsByMonth.length - 1]?.remainingBreakdown.map((b) => (
                  <tr key={b.batchId} className="border-b border-gray-200">
                    <td className="p-1 font-bold border-r border-gray-200">{formatPeriodShort(b.originPeriod)}</td>
                    <td className="p-1 text-right border-r border-gray-200">{formatCurrency(b.originalAmount)}</td>
                    <td className="p-1 text-right font-bold border-r border-gray-200">{formatCurrency(b.remainingAmount)}</td>
                    <td className="p-1 text-center">{getStatusLabel(b.status, b.monthsOld).label}</td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={4} className="p-2 text-center text-gray-500">Nenhum lote ativo</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Rodapé / Assinatura Fiscal */}
      <div className="pt-8 border-t border-gray-300 flex justify-between items-center text-[10px] text-gray-600">
        <div>
          Controle de Crédito em conformidade com as Leis nº 10.637/2002 e 10.833/2003 e IN RFB nº 2.121/2022.
        </div>
        <div className="text-right">
          Página 1 de 1 - Simulador de PIS/COFINS
        </div>
      </div>
    </div>
  );
};
