export type TaxType = 'PIS' | 'COFINS';

export type CreditStatus = 'healthy' | 'warning' | 'critical' | 'prescribed';

export interface InitialCreditStock {
  id: string;
  originPeriod: string; // Formato AAAA-MM
  amount: number;
  notes?: string;
}

export interface MonthlyInput {
  id: string;
  period: string; // Formato AAAA-MM
  
  // PIS - Valores Principais e Ajustes Detalhados
  pisDebit: number; // Total Débito
  pisOtherDebits?: number; // Outros Débitos (+)
  pisBaseReduction?: number; // Ajuste BC Redução (-)
  pisBaseIncrease?: number; // Ajuste BC Acréscimo (+)
  pisDebitReversal?: number; // Estorno Débito (-)
  pisWithholdings?: number; // Retenções (-)
  pisCredit: number; // Total Crédito
  pisOtherCredits?: number; // Outros Créditos (+)
  pisCreditReversal?: number; // Estorno Créditos (-)
  pisExclusions?: number; // Exclusão (-)

  // COFINS - Valores Principais e Ajustes Detalhados
  cofinsDebit: number; // Total Débito
  cofinsOtherDebits?: number; // Outros Débitos (+)
  cofinsBaseReduction?: number; // Ajuste BC Redução (-)
  cofinsBaseIncrease?: number; // Ajuste BC Acréscimo (+)
  cofinsDebitReversal?: number; // Estorno Débito (-)
  cofinsWithholdings?: number; // Retenções (-)
  cofinsCredit: number; // Total Crédito
  cofinsOtherCredits?: number; // Outros Créditos (+)
  cofinsCreditReversal?: number; // Estorno Créditos (-)
  cofinsExclusions?: number; // Exclusão (-)

  notes?: string;
}

export interface CreditBatch {
  id: string;
  originPeriod: string; // AAAA-MM
  originalAmount: number;
  remainingAmount: number;
  isInitialStock?: boolean;
}

export interface CreditConsumptionDetail {
  batchId: string;
  originPeriod: string;
  amountConsumed: number;
  monthsOldAtConsumption: number;
}

export interface CreditRemainingDetail {
  batchId: string;
  originPeriod: string;
  remainingAmount: number;
  originalAmount: number;
  monthsOld: number;
  status: CreditStatus;
}

export interface MonthlyTaxDetails {
  grossDebit: number;
  otherDebits: number;
  baseReduction: number;
  baseIncrease: number;
  debitReversal: number;
  netDebit: number;
  withholdings: number;

  grossCredit: number;
  otherCredits: number;
  creditReversal: number;
  exclusions: number;
  netCredit: number;
}

export interface MonthlyTaxResult {
  period: string;
  debit: number; // Débito Líquido apurado
  creditGenerated: number; // Crédito Líquido gerado
  details: MonthlyTaxDetails; // Detalhamento dos ajustes contábeis
  previousBalance: number;
  totalAvailable: number;
  creditConsumed: number;
  taxPayable: number;
  balanceCarriedForward: number;
  consumedBreakdown: CreditConsumptionDetail[];
  remainingBreakdown: CreditRemainingDetail[];
  prescribedThisMonth: number;
}

export interface TaxSimulationSummary {
  taxType: TaxType;
  totalDebits: number;
  totalCreditsGenerated: number;
  totalCreditsConsumed: number;
  totalTaxPayable: number;
  currentBalanceCarriedForward: number;
  totalPrescribed: number;
  activeBatchesCount: number;
  atRiskBatchesCount: number;
  resultsByMonth: MonthlyTaxResult[];
}

export interface Scenario {
  id: string;
  name: string;
  companyName: string;
  cnpj?: string;
  createdAt: string;
  updatedAt: string;
  initialStockPIS: InitialCreditStock[];
  initialStockCOFINS: InitialCreditStock[];
  months: MonthlyInput[];
}
