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
  pisDebit: number;
  pisCredit: number;
  cofinsDebit: number;
  cofinsCredit: number;
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

export interface MonthlyTaxResult {
  period: string;
  debit: number;
  creditGenerated: number;
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
  atRiskBatchesCount: number; // > 48 meses
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
