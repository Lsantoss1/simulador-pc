import { runTaxSimulation } from './creditEngine';
import { InitialCreditStock, MonthlyInput } from '../types/tax';

const initialStocks: InitialCreditStock[] = [
  { id: '1', originPeriod: '2023-11', amount: 5000 },
  { id: '2', originPeriod: '2023-12', amount: 3000 },
];

const months: MonthlyInput[] = [
  {
    id: 'm1',
    period: '2024-01',
    pisDebit: 6000,
    pisCredit: 4000,
    cofinsDebit: 0,
    cofinsCredit: 0,
  },
  {
    id: 'm2',
    period: '2024-02',
    pisDebit: 7000,
    pisCredit: 0,
    cofinsDebit: 0,
    cofinsCredit: 0,
  },
];

console.log('--- EXECUTANDO TESTE CONTÁBIL PIS ---');
const res = runTaxSimulation('PIS', initialStocks, months);

console.log(`Mês 01/2024:`);
const m1 = res.resultsByMonth[0];
console.log(`  Débito: ${m1.debit}`);
console.log(`  Crédito Gerado: ${m1.creditGenerated}`);
console.log(`  Crédito Consumido: ${m1.creditConsumed}`);
console.log(`  Imposto a Pagar: ${m1.taxPayable}`);
console.log(`  Saldo a Transportar: ${m1.balanceCarriedForward}`);
console.log(`  Detalhamento Consumido:`, m1.consumedBreakdown);
console.log(`  Detalhamento Sobra:`, m1.remainingBreakdown);

console.log(`\nMês 02/2024:`);
const m2 = res.resultsByMonth[1];
console.log(`  Débito: ${m2.debit}`);
console.log(`  Crédito Gerado: ${m2.creditGenerated}`);
console.log(`  Crédito Consumido: ${m2.creditConsumed}`);
console.log(`  Imposto a Pagar: ${m2.taxPayable}`);
console.log(`  Saldo a Transportar: ${m2.balanceCarriedForward}`);
console.log(`  Detalhamento Consumido:`, m2.consumedBreakdown);
console.log(`  Detalhamento Sobra:`, m2.remainingBreakdown);

// Verificações
const assert = (condition: boolean, msg: string) => {
  if (!condition) {
    console.error(`FALHA: ${msg}`);
    process.exit(1);
  } else {
    console.log(`SUCESSO: ${msg}`);
  }
};

assert(m1.balanceCarriedForward === 6000, 'Saldo transportar Mês 1 deve ser 6000');
assert(m1.taxPayable === 0, 'Imposto a pagar Mês 1 deve ser 0');
assert(m1.consumedBreakdown.length === 2, 'Consumido deve ter 2 parcelas (2023-11 e 2023-12)');
assert(m1.consumedBreakdown[0].amountConsumed === 5000, 'Consumiu 5000 de 2023-11');
assert(m1.consumedBreakdown[1].amountConsumed === 1000, 'Consumiu 1000 de 2023-12');
assert(m1.remainingBreakdown.length === 2, 'Sobraram 2 lotes (2023-12 e 2024-01)');
assert(m1.remainingBreakdown[0].remainingAmount === 2000, 'Sobraram 2000 de 2023-12');
assert(m1.remainingBreakdown[1].remainingAmount === 4000, 'Sobraram 4000 de 2024-01');

assert(m2.balanceCarriedForward === 0, 'Saldo transportar Mês 2 deve ser 0');
assert(m2.taxPayable === 1000, 'Imposto a pagar Mês 2 deve ser 1000');
assert(m2.creditConsumed === 6000, 'Consumiu 6000 no Mês 2');

console.log('\n>>> TODOS OS TESTES CONTÁBEIS PASSARAM COM SUCESSO! <<<');
