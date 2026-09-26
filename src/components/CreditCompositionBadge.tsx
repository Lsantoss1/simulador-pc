import React from 'react';
import type { CreditRemainingDetail } from '../types/tax';
import { formatCurrency, formatPeriodShort, getStatusLabel } from '../utils/formatters';
import { AlertTriangle, Clock, CheckCircle, ShieldAlert } from 'lucide-react';

interface Props {
  batch: CreditRemainingDetail;
  showOriginal?: boolean;
}

export const CreditCompositionBadge: React.FC<Props> = ({ batch, showOriginal = true }) => {
  const statusInfo = getStatusLabel(batch.status, batch.monthsOld);

  const getIcon = () => {
    switch (batch.status) {
      case 'prescribed':
        return <ShieldAlert className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />;
      case 'critical':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />;
      case 'warning':
        return <Clock className="w-3.5 h-3.5 text-yellow-600 flex-shrink-0" />;
      case 'healthy':
      default:
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />;
    }
  };

  const percentUsed = batch.originalAmount > 0 
    ? Math.max(0, Math.min(100, Math.round(((batch.originalAmount - batch.remainingAmount) / batch.originalAmount) * 100)))
    : 0;

  return (
    <div
      className={`border rounded-lg p-2.5 bg-white shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
        batch.status === 'critical'
          ? 'border-amber-300 ring-1 ring-amber-200'
          : batch.status === 'prescribed'
          ? 'border-red-300 ring-1 ring-red-200'
          : 'border-slate-200'
      }`}
      title={statusInfo.text}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          {getIcon()}
          <span className="font-semibold text-xs text-slate-800">
            Origem: {formatPeriodShort(batch.originPeriod)}
          </span>
        </div>
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border flex items-center gap-1 ${statusInfo.badgeClass}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
          {statusInfo.label}
        </span>
      </div>

      <div className="mt-1">
        <div className="text-xs text-slate-500 font-medium">Sobra a Transportar</div>
        <div className="text-sm font-bold text-slate-900">
          {formatCurrency(batch.remainingAmount)}
        </div>
      </div>

      {showOriginal && (
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Orig.: {formatCurrency(batch.originalAmount)}</span>
          <span className="text-slate-400">
            {percentUsed > 0 ? `${percentUsed}% consumido` : 'Intacto'}
          </span>
        </div>
      )}
    </div>
  );
};
