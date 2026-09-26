import * as XLSX from 'xlsx';
import type { Scenario, TaxSimulationSummary } from '../types/tax';
import { formatCurrency, formatPeriodShort, getStatusLabel } from './formatters';

export const exportSimulationToExcel = (
  scenario: Scenario,
  pisSummary: TaxSimulationSummary,
  cofinsSummary: TaxSimulationSummary
) => {
  const wb = XLSX.utils.book_new();

  // Helper para criar linhas da apuração
  const createTaxSheetData = (summary: TaxSimulationSummary, taxName: string) => {
    const rows = [
      [`SIMULAÇÃO CONTÁBIL DE ${taxName} - CONTROLE PEPS / FIFO`],
      [`Empresa: ${scenario.companyName}`, `CNPJ: ${scenario.cnpj || 'Não informado'}`],
      [`Cenário: ${scenario.name}`, `Gerado em: ${new Date().toLocaleDateString('pt-BR')}`],
      [],
      [
        'Competência',
        'Saldo Anterior (R$)',
        'Crédito do Mês (R$)',
        'Total Disponível (R$)',
        'Débito do Mês (R$)',
        'Crédito Consumido (R$)',
        'Imposto a Recolher (R$)',
        'Saldo a Transportar (R$)',
        'Composição da Sobra (Mês Origem: R$)',
      ],
    ];

    summary.resultsByMonth.forEach((r) => {
      const breakdownText = r.remainingBreakdown
        .map((b) => `${formatPeriodShort(b.originPeriod)}: ${formatCurrency(b.remainingAmount)}`)
        .join(' | ') || 'Nenhum saldo restante';

      rows.push([
        formatPeriodShort(r.period),
        r.previousBalance as any,
        r.creditGenerated as any,
        r.totalAvailable as any,
        r.debit as any,
        r.creditConsumed as any,
        r.taxPayable as any,
        r.balanceCarriedForward as any,
        breakdownText as any,
      ]);
    });

    // Linha de Totais
    rows.push([]);
    rows.push([
      'TOTAIS CONSOLIDADOS',
      '',
      summary.totalCreditsGenerated as any,
      '',
      summary.totalDebits as any,
      summary.totalCreditsConsumed as any,
      summary.totalTaxPayable as any,
      summary.currentBalanceCarriedForward as any,
      `Lotes ativos: ${summary.activeBatchesCount} (${summary.atRiskBatchesCount} em risco)`,
    ]);

    return rows;
  };

  // 1. Aba PIS
  const wsPIS = XLSX.utils.aoa_to_sheet(createTaxSheetData(pisSummary, 'PIS'));
  wsPIS['!cols'] = [
    { wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 18 },
    { wch: 18 }, { wch: 20 }, { wch: 20 }, { wch: 22 }, { wch: 50 },
  ];
  XLSX.utils.book_append_sheet(wb, wsPIS, 'Apuração PIS');

  // 2. Aba COFINS
  const wsCOFINS = XLSX.utils.aoa_to_sheet(createTaxSheetData(cofinsSummary, 'COFINS'));
  wsCOFINS['!cols'] = [
    { wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 18 },
    { wch: 18 }, { wch: 20 }, { wch: 20 }, { wch: 22 }, { wch: 50 },
  ];
  XLSX.utils.book_append_sheet(wb, wsCOFINS, 'Apuração COFINS');

  // 3. Aba Estoque Inicial
  const stockRows = [
    ['ESTOQUE INICIAL DE CRÉDITOS ACUMULADOS DE PERÍODOS ANTERIORES'],
    [],
    ['Tributo', 'Competência Origem', 'Valor Inicial (R$)', 'Observações'],
  ];

  scenario.initialStockPIS.forEach((s) => {
    stockRows.push(['PIS', formatPeriodShort(s.originPeriod), s.amount as any, s.notes || '']);
  });
  scenario.initialStockCOFINS.forEach((s) => {
    stockRows.push(['COFINS', formatPeriodShort(s.originPeriod), s.amount as any, s.notes || '']);
  });

  const wsStock = XLSX.utils.aoa_to_sheet(stockRows);
  wsStock['!cols'] = [{ wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 35 }];
  XLSX.utils.book_append_sheet(wb, wsStock, 'Estoque Inicial');

  // 4. Aba Composição Detalhada Final
  const finalCompositionRows = [
    ['COMPOSIÇÃO DETALHADA DOS CRÉDITOS REMANESCENTES POR COMPETÊNCIA DE ORIGEM'],
    [`Empresa: ${scenario.companyName} | Cenário: ${scenario.name}`],
    [],
    ['Tributo', 'Competência Origem', 'Valor Original (R$)', 'Saldo Restante (R$)', 'Idade (Meses)', 'Status de Prescrição'],
  ];

  const lastPIS = pisSummary.resultsByMonth[pisSummary.resultsByMonth.length - 1];
  if (lastPIS) {
    lastPIS.remainingBreakdown.forEach((b) => {
      const statusInfo = getStatusLabel(b.status, b.monthsOld);
      finalCompositionRows.push([
        'PIS',
        formatPeriodShort(b.originPeriod),
        b.originalAmount as any,
        b.remainingAmount as any,
        b.monthsOld as any,
        statusInfo.label,
      ]);
    });
  }

  const lastCOFINS = cofinsSummary.resultsByMonth[cofinsSummary.resultsByMonth.length - 1];
  if (lastCOFINS) {
    lastCOFINS.remainingBreakdown.forEach((b) => {
      const statusInfo = getStatusLabel(b.status, b.monthsOld);
      finalCompositionRows.push([
        'COFINS',
        formatPeriodShort(b.originPeriod),
        b.originalAmount as any,
        b.remainingAmount as any,
        b.monthsOld as any,
        statusInfo.label,
      ]);
    });
  }

  const wsComp = XLSX.utils.aoa_to_sheet(finalCompositionRows);
  wsComp['!cols'] = [{ wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, wsComp, 'Composição dos Créditos');

  // Salvar arquivo
  const filename = `Simulacao_PIS_COFINS_${scenario.name.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(wb, filename);
};

export const downloadImportTemplate = () => {
  const wb = XLSX.utils.book_new();
  const templateRows = [
    ['Competencia (AAAA-MM)', 'Debito PIS (R$)', 'Credito PIS (R$)', 'Debito COFINS (R$)', 'Credito COFINS (R$)', 'Observacoes'],
    ['2024-01', 10000.00, 5000.00, 46000.00, 23000.00, 'Exemplo Janeiro'],
    ['2024-02', 12000.00, 8000.00, 55000.00, 36000.00, 'Exemplo Fevereiro'],
    ['2024-03', 15000.00, 4000.00, 69000.00, 18000.00, 'Exemplo Março'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(templateRows);
  ws['!cols'] = [{ wch: 24 }, { wch: 18 }, { wch: 18 }, { wch: 20 }, { wch: 20 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Lancamentos');
  XLSX.writeFile(wb, 'Modelo_Lancamentos_PIS_COFINS.xlsx');
};
