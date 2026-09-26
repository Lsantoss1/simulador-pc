import type { CreditStatus } from '../types/tax';

export const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const parseCurrencyInput = (value: string): number => {
  if (!value) return 0;
  const clean = value.replace(/[^\d,-]/g, '').replace(',', '.');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

export const formatPeriod = (period: string): string => {
  if (!period) return '';
  const parts = period.split('-');
  if (parts.length === 2) {
    const [year, month] = parts;
    const monthNames = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    const mIdx = parseInt(month, 10) - 1;
    const name = monthNames[mIdx] || month;
    return `${name}/${year} (${month}/${year})`;
  }
  return period;
};

export const formatPeriodShort = (period: string): string => {
  if (!period) return '';
  const parts = period.split('-');
  if (parts.length === 2) {
    return `${parts[1]}/${parts[0]}`;
  }
  return period;
};

export const calculatePeriodAge = (originPeriod: string, currentPeriod: string): number => {
  if (!originPeriod || !currentPeriod) return 0;
  const [origYear, origMonth] = originPeriod.split('-').map(Number);
  const [currYear, currMonth] = currentPeriod.split('-').map(Number);

  if (isNaN(origYear) || isNaN(origMonth) || isNaN(currYear) || isNaN(currMonth)) return 0;

  return (currYear - origYear) * 12 + (currMonth - origMonth);
};

export const getCreditStatus = (ageInMonths: number): CreditStatus => {
  if (ageInMonths >= 60) return 'prescribed';
  if (ageInMonths >= 48) return 'critical';
  if (ageInMonths >= 36) return 'warning';
  return 'healthy';
};

export const getStatusLabel = (status: CreditStatus, ageInMonths: number) => {
  switch (status) {
    case 'prescribed':
      return {
        label: `Prescrito (${ageInMonths}m)`,
        badgeClass: 'bg-red-100 text-red-800 border-red-300',
        dotClass: 'bg-red-500',
        text: 'Crédito com mais de 5 anos (60 meses). Não pode mais ser aproveitado segundo as regras da RFB.',
      };
    case 'critical':
      return {
        label: `Crítico (${ageInMonths}m)`,
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-semibold',
        dotClass: 'bg-amber-500',
        text: 'Risco de prescrição! Restam menos de 12 meses para o prazo limite de 5 anos.',
      };
    case 'warning':
      return {
        label: `Atenção (${ageInMonths}m)`,
        badgeClass: 'bg-yellow-50 text-yellow-800 border-yellow-200',
        dotClass: 'bg-yellow-400',
        text: 'Crédito acumulado há mais de 3 anos. Recomenda-se priorizar sua utilização.',
      };
    case 'healthy':
    default:
      return {
        label: `Vigente (${ageInMonths}m)`,
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotClass: 'bg-emerald-500',
        text: 'Crédito recente e regular dentro do prazo quinquenal.',
      };
  }
};

export const getNextPeriod = (period: string): string => {
  const parts = period.split('-').map(Number);
  if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  let [year, month] = parts;
  month += 1;
  if (month > 12) {
    month = 1;
    year += 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
};

export const round2 = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};
