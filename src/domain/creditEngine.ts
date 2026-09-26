import type {
  CreditBatch,
  CreditConsumptionDetail,
  CreditRemainingDetail,
  InitialCreditStock,
  MonthlyInput,
  MonthlyTaxResult,
  TaxSimulationSummary,
  TaxType,
} from '../types/tax';
import { calculatePeriodAge, getCreditStatus, round2 } from '../utils/formatters';

export const runTaxSimulation = (
  taxType: TaxType,
  initialStocks: InitialCreditStock[],
  monthlyInputs: MonthlyInput[]
): TaxSimulationSummary => {
  // 1. Clonar e inicializar os lotes de créditos acumulados anteriores
  const activeBatches: CreditBatch[] = initialStocks
    .filter((s) => s.amount > 0)
    .sort((a, b) => a.originPeriod.localeCompare(b.originPeriod))
    .map((stock) => ({
      id: stock.id,
      originPeriod: stock.originPeriod,
      originalAmount: round2(stock.amount),
      remainingAmount: round2(stock.amount),
      isInitialStock: true,
    }));

  // 2. Ordenar os meses cronologicamente
  const sortedMonths = [...monthlyInputs].sort((a, b) =>
    a.period.localeCompare(b.period)
  );

  const resultsByMonth: MonthlyTaxResult[] = [];
  let totalDebits = 0;
  let totalCreditsGenerated = 0;
  let totalCreditsConsumed = 0;
  let totalTaxPayable = 0;
  let totalPrescribed = 0;

  for (const month of sortedMonths) {
    const debit = round2(taxType === 'PIS' ? month.pisDebit : month.cofinsDebit);
    const creditGen = round2(taxType === 'PIS' ? month.pisCredit : month.cofinsCredit);

    totalDebits = round2(totalDebits + debit);
    totalCreditsGenerated = round2(totalCreditsGenerated + creditGen);

    // Saldo credor antes do mês atual
    const previousBalance = round2(
      activeBatches.reduce((sum, b) => sum + b.remainingAmount, 0)
    );

    // Adiciona o crédito apurado no próprio mês como novo lote
    if (creditGen > 0) {
      activeBatches.push({
        id: `gen-${month.id}-${month.period}`,
        originPeriod: month.period,
        originalAmount: creditGen,
        remainingAmount: creditGen,
        isInitialStock: false,
      });
    }

    // Garante ordenação PEPS (lotes mais antigos primeiro)
    activeBatches.sort((a, b) => a.originPeriod.localeCompare(b.originPeriod));

    const totalAvailable = round2(previousBalance + creditGen);

    // 3. Processamento do Abatimento via PEPS / FIFO
    let debitToOffset = debit;
    const consumedBreakdown: CreditConsumptionDetail[] = [];

    for (const batch of activeBatches) {
      if (debitToOffset <= 0.0001) break;
      if (batch.remainingAmount <= 0.0001) continue;

      const consume = round2(Math.min(debitToOffset, batch.remainingAmount));
      batch.remainingAmount = round2(batch.remainingAmount - consume);
      debitToOffset = round2(debitToOffset - consume);

      const age = calculatePeriodAge(batch.originPeriod, month.period);
      consumedBreakdown.push({
        batchId: batch.id,
        originPeriod: batch.originPeriod,
        amountConsumed: consume,
        monthsOldAtConsumption: age,
      });
    }

    const monthCreditConsumed = round2(debit - Math.max(0, debitToOffset));
    totalCreditsConsumed = round2(totalCreditsConsumed + monthCreditConsumed);

    // Se o débito superou todos os créditos disponíveis, gera imposto a pagar
    const taxPayable = debitToOffset > 0.0001 ? round2(debitToOffset) : 0;
    totalTaxPayable = round2(totalTaxPayable + taxPayable);

    // Checagem de prescrição (lotes com >= 60 meses no mês corrente)
    let prescribedThisMonth = 0;
    const balanceCarriedForward = round2(
      activeBatches.reduce((sum, b) => sum + b.remainingAmount, 0)
    );

    // 4. Composição da Sobra de Crédito por Mês de Origem
    const remainingBreakdown: CreditRemainingDetail[] = activeBatches
      .filter((b) => b.remainingAmount > 0.009)
      .map((b) => {
        const age = calculatePeriodAge(b.originPeriod, month.period);
        const status = getCreditStatus(age);
        if (status === 'prescribed') {
          prescribedThisMonth = round2(prescribedThisMonth + b.remainingAmount);
        }
        return {
          batchId: b.id,
          originPeriod: b.originPeriod,
          remainingAmount: b.remainingAmount,
          originalAmount: b.originalAmount,
          monthsOld: age,
          status,
        };
      });

    totalPrescribed = round2(totalPrescribed + prescribedThisMonth);

    resultsByMonth.push({
      period: month.period,
      debit,
      creditGenerated: creditGen,
      previousBalance,
      totalAvailable,
      creditConsumed: monthCreditConsumed,
      taxPayable,
      balanceCarriedForward,
      consumedBreakdown,
      remainingBreakdown,
      prescribedThisMonth,
    });
  }

  // Estatísticas finais
  const lastResult = resultsByMonth[resultsByMonth.length - 1];
  const currentBalance = lastResult
    ? lastResult.balanceCarriedForward
    : round2(activeBatches.reduce((sum, b) => sum + b.remainingAmount, 0));

  const activeRemaining = lastResult ? lastResult.remainingBreakdown : [];
  const atRiskBatchesCount = activeRemaining.filter(
    (b) => b.status === 'critical' || b.status === 'warning'
  ).length;

  return {
    taxType,
    totalDebits,
    totalCreditsGenerated,
    totalCreditsConsumed,
    totalTaxPayable,
    currentBalanceCarriedForward: currentBalance,
    totalPrescribed,
    activeBatchesCount: activeRemaining.length,
    atRiskBatchesCount,
    resultsByMonth,
  };
};
