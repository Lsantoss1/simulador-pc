import React, { useState } from 'react';
import type { MonthlyInput } from '../types/tax';
import { formatCurrency, formatPeriodShort, round2 } from '../utils/formatters';
import { X, Calculator, Sparkles, Check, HelpCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  month: MonthlyInput;
  previousPisBalance?: number;
  previousCofinsBalance?: number;
  onSave: (updatedMonth: MonthlyInput) => void;
}

export const TaxAdjustmentsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  month,
  previousPisBalance = 0,
  previousCofinsBalance = 0,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'PIS' | 'COFINS'>('PIS');
  const [draft, setDraft] = useState<MonthlyInput>({ ...month });

  // Sincroniza draft ao abrir ou alterar month
  React.useEffect(() => {
    setDraft({ ...month });
  }, [month, isOpen]);

  if (!isOpen) return null;

  const isPIS = activeTab === 'PIS';

  // Valores PIS
  const pisGrossDebit = draft.pisDebit || 0;
  const pisOtherDebits = draft.pisOtherDebits || 0;
  const pisBaseReduction = draft.pisBaseReduction || 0;
  const pisBaseIncrease = draft.pisBaseIncrease || 0;
  const pisDebitReversal = draft.pisDebitReversal || 0;
  const pisWithholdings = draft.pisWithholdings || 0;

  const pisGrossCredit = draft.pisCredit || 0;
  const pisOtherCredits = draft.pisOtherCredits || 0;
  const pisCreditReversal = draft.pisCreditReversal || 0;
  const pisExclusions = draft.pisExclusions || 0;

  const pisNetDebit = round2(
    Math.max(0, (pisGrossDebit + pisOtherDebits + pisBaseIncrease) - (pisBaseReduction + pisDebitReversal))
  );
  const pisNetCredit = round2(
    Math.max(0, (pisGrossCredit + pisOtherCredits) - (pisCreditReversal + pisExclusions))
  );

  const pisAvailable = round2(previousPisBalance + pisNetCredit);
  const pisRemaining = round2(Math.max(0, pisAvailable - pisNetDebit));
  const pisDebitRemaining = round2(Math.max(0, pisNetDebit - pisAvailable));
  const pisPayable = round2(Math.max(0, pisDebitRemaining - pisWithholdings));

  // Valores COFINS
  const cofinsGrossDebit = draft.cofinsDebit || 0;
  const cofinsOtherDebits = draft.cofinsOtherDebits || 0;
  const cofinsBaseReduction = draft.cofinsBaseReduction || 0;
  const cofinsBaseIncrease = draft.cofinsBaseIncrease || 0;
  const cofinsDebitReversal = draft.cofinsDebitReversal || 0;
  const cofinsWithholdings = draft.cofinsWithholdings || 0;

  const cofinsGrossCredit = draft.cofinsCredit || 0;
  const cofinsOtherCredits = draft.cofinsOtherCredits || 0;
  const cofinsCreditReversal = draft.cofinsCreditReversal || 0;
  const cofinsExclusions = draft.cofinsExclusions || 0;

  const cofinsNetDebit = round2(
    Math.max(0, (cofinsGrossDebit + cofinsOtherDebits + cofinsBaseIncrease) - (cofinsBaseReduction + cofinsDebitReversal))
  );
  const cofinsNetCredit = round2(
    Math.max(0, (cofinsGrossCredit + cofinsOtherCredits) - (cofinsCreditReversal + cofinsExclusions))
  );

  const cofinsAvailable = round2(previousCofinsBalance + cofinsNetCredit);
  const cofinsRemaining = round2(Math.max(0, cofinsAvailable - cofinsNetDebit));
  const cofinsDebitRemaining = round2(Math.max(0, cofinsNetDebit - cofinsAvailable));
  const cofinsPayable = round2(Math.max(0, cofinsDebitRemaining - cofinsWithholdings));

  // Seleção atual
  const currentNetDebit = isPIS ? pisNetDebit : cofinsNetDebit;
  const currentNetCredit = isPIS ? pisNetCredit : cofinsNetCredit;
  const currentPrevBalance = isPIS ? previousPisBalance : previousCofinsBalance;
  const currentRemaining = isPIS ? pisRemaining : cofinsRemaining;
  const currentPayable = isPIS ? pisPayable : cofinsPayable;

  const handleFieldChange = (field: keyof MonthlyInput, val: number) => {
    setDraft((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const handleFillPhotoExample = () => {
    setDraft((prev) => ({
      ...prev,
      // PIS da foto
      pisDebit: 17641.62,
      pisOtherDebits: 346.99,
      pisBaseReduction: 2158.77,
      pisBaseIncrease: 0,
      pisDebitReversal: 0,
      pisWithholdings: 0,
      pisCredit: 16236.45,
      pisOtherCredits: 0,
      pisCreditReversal: 0,
      pisExclusions: 0,
      // COFINS da foto
      cofinsDebit: 81258.36,
      cofinsOtherDebits: 1695.37,
      cofinsBaseReduction: 9943.44,
      cofinsBaseIncrease: 0,
      cofinsDebitReversal: 0,
      cofinsWithholdings: 0,
      cofinsCredit: 74786.06,
      cofinsOtherCredits: 0,
      cofinsCreditReversal: 0,
      cofinsExclusions: 0,
    }));
  };

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-800">
                  Ajustes Detalhados de Apuração ({formatPeriodShort(draft.period)})
                </h3>
                <span className="text-[11px] font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                  Blocos M210/M610 & 1100/1500
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Layout contábil fiel para ajustes de débitos, créditos, exclusões e bases de cálculo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFillPhotoExample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors shadow-sm"
              title="Preenche este mês com os valores exatos da imagem fornecida"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Carregar Exemplo da Foto
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tributo Tab Selector */}
        <div className="px-6 pt-3 bg-slate-100/60 border-b border-slate-200 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('PIS')}
              className={`px-4 py-2 font-bold text-xs rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'PIS'
                  ? 'bg-white text-indigo-700 border-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 border-transparent'
              }`}
            >
              <span>PIS (1,65%)</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full font-mono">
                {formatCurrency(pisRemaining)} a transportar
              </span>
            </button>

            <button
              onClick={() => setActiveTab('COFINS')}
              className={`px-4 py-2 font-bold text-xs rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'COFINS'
                  ? 'bg-white text-emerald-700 border-emerald-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 border-transparent'
              }`}
            >
              <span>COFINS (7,60%)</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-mono">
                {formatCurrency(cofinsRemaining)} a transportar
              </span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            Competência: <strong className="font-mono text-slate-800">{draft.period}</strong>
          </div>
        </div>

        {/* Modal Body: 2 Columns matching user screenshot */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coluna 1: Débitos & Reduções */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  Débitos e Ajustes na Base
                </h4>
                <span className="text-[11px] font-mono font-bold text-slate-700">
                  Líquido: {formatCurrency(currentNetDebit)}
                </span>
              </div>

              {/* Total Débito */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Total Débito (R$)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Saídas e receitas brutas</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={isPIS ? (draft.pisDebit === 0 ? '' : draft.pisDebit) : (draft.cofinsDebit === 0 ? '' : draft.cofinsDebit)}
                  placeholder="0,00"
                  onChange={(e) =>
                    handleFieldChange(
                      isPIS ? 'pisDebit' : 'cofinsDebit',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              {/* Outros Débitos (+) */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span className="text-amber-800 font-bold">Outros Débitos (+)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Ajustes M211/M611</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={isPIS ? (draft.pisOtherDebits === 0 ? '' : draft.pisOtherDebits) : (draft.cofinsOtherDebits === 0 ? '' : draft.cofinsOtherDebits)}
                  placeholder="0,00"
                  onChange={(e) =>
                    handleFieldChange(
                      isPIS ? 'pisOtherDebits' : 'cofinsOtherDebits',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              {/* Ajuste BC Redução (-) */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span className="text-blue-800 font-bold">Ajuste BC Redução (-)</span>
                  <span className="text-[10px] text-slate-400 font-normal">ICMS excluído, devoluções</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={isPIS ? (draft.pisBaseReduction === 0 ? '' : draft.pisBaseReduction) : (draft.cofinsBaseReduction === 0 ? '' : draft.cofinsBaseReduction)}
                  placeholder="0,00"
                  onChange={(e) =>
                    handleFieldChange(
                      isPIS ? 'pisBaseReduction' : 'cofinsBaseReduction',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full px-3 py-1.5 border border-blue-200 bg-blue-50/40 rounded-lg text-xs font-mono font-bold text-blue-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Ajuste BC Acréscimo (+) */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Ajuste BC Acréscimo (+)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Acréscimos legais na BC</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={isPIS ? (draft.pisBaseIncrease === 0 ? '' : draft.pisBaseIncrease) : (draft.cofinsBaseIncrease === 0 ? '' : draft.cofinsBaseIncrease)}
                  placeholder="0,00"
                  onChange={(e) =>
                    handleFieldChange(
                      isPIS ? 'pisBaseIncrease' : 'cofinsBaseIncrease',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              {/* Estorno Débito (-) */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Estorno Débito (-)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Cancelamentos de débito</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={isPIS ? (draft.pisDebitReversal === 0 ? '' : draft.pisDebitReversal) : (draft.cofinsDebitReversal === 0 ? '' : draft.cofinsDebitReversal)}
                  placeholder="0,00"
                  onChange={(e) =>
                    handleFieldChange(
                      isPIS ? 'pisDebitReversal' : 'cofinsDebitReversal',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              {/* Retenções (-) */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span className="text-purple-800 font-bold">Retenções na Fonte (-)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Dedução de DARF (Lei 10.833)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={isPIS ? (draft.pisWithholdings === 0 ? '' : draft.pisWithholdings) : (draft.cofinsWithholdings === 0 ? '' : draft.cofinsWithholdings)}
                  placeholder="0,00"
                  onChange={(e) =>
                    handleFieldChange(
                      isPIS ? 'pisWithholdings' : 'cofinsWithholdings',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full px-3 py-1.5 border border-purple-200 bg-purple-50/30 rounded-lg text-xs font-mono text-purple-900 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Saldo Credor Anterior (Leitura) */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Saldo Credor Anterior:</span>
                <span className="font-mono font-bold text-slate-800">
                  {formatCurrency(currentPrevBalance)}
                </span>
              </div>
            </div>

            {/* Coluna 2: Créditos, Exclusões e Saldos */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  Créditos, Exclusões e Resultados
                </h4>
                <span className="text-[11px] font-mono font-bold text-emerald-800">
                  Líquido: {formatCurrency(currentNetCredit)}
                </span>
              </div>

              {/* Total Crédito */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Total Crédito (R$)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Entradas, insumos, compras</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={isPIS ? (draft.pisCredit === 0 ? '' : draft.pisCredit) : (draft.cofinsCredit === 0 ? '' : draft.cofinsCredit)}
                  placeholder="0,00"
                  onChange={(e) =>
                    handleFieldChange(
                      isPIS ? 'pisCredit' : 'cofinsCredit',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              {/* Outros Créditos (+) */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span className="text-emerald-800 font-bold">Outros Créditos (+)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Ajustes extemporâneos M110/M510</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={isPIS ? (draft.pisOtherCredits === 0 ? '' : draft.pisOtherCredits) : (draft.cofinsOtherCredits === 0 ? '' : draft.cofinsOtherCredits)}
                  placeholder="0,00"
                  onChange={(e) =>
                    handleFieldChange(
                      isPIS ? 'pisOtherCredits' : 'cofinsOtherCredits',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              {/* Exclusão (-) */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span className="text-rose-800 font-bold">Exclusão de Crédito (-)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Exclusões legais de créditos</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={isPIS ? (draft.pisExclusions === 0 ? '' : draft.pisExclusions) : (draft.cofinsExclusions === 0 ? '' : draft.cofinsExclusions)}
                  placeholder="0,00"
                  onChange={(e) =>
                    handleFieldChange(
                      isPIS ? 'pisExclusions' : 'cofinsExclusions',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              {/* Estorno Créditos (-) */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span className="text-rose-800 font-bold">Estorno de Créditos (-)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Perdas, avarias ou estornos</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={isPIS ? (draft.pisCreditReversal === 0 ? '' : draft.pisCreditReversal) : (draft.cofinsCreditReversal === 0 ? '' : draft.cofinsCreditReversal)}
                  placeholder="0,00"
                  onChange={(e) =>
                    handleFieldChange(
                      isPIS ? 'pisCreditReversal' : 'cofinsCreditReversal',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              {/* Boxes de Resultado em Tempo Real (Idêntico à foto) */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-indigo-900 block">
                      Saldo a Transportar
                    </span>
                    <span className="text-[10px] text-indigo-600">
                      Crédito acumulado para o próximo mês
                    </span>
                  </div>
                  <span className="text-base font-black font-mono text-indigo-900">
                    {formatCurrency(currentRemaining)}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Saldo a Pagar (DARF)
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Após abater créditos e retenções
                    </span>
                  </div>
                  <span
                    className={`text-base font-black font-mono ${
                      currentPayable > 0 ? 'text-rose-600' : 'text-slate-500'
                    }`}
                  >
                    {formatCurrency(currentPayable)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Memória e Fórmula */}
          <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-0.5">Memória de Cálculo Aplicada Conforme Legislação & EFD:</p>
              <p className="text-[11px] text-amber-800 leading-relaxed font-mono">
                Débito Líquido = (Total Débito + Outros Débitos + Ajuste BC Acréscimo) - (Ajuste BC Redução + Estorno Débito)
                <br />
                Crédito Líquido = (Total Crédito + Outros Créditos) - (Estorno Créditos + Exclusão)
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Check className="w-4 h-4" />
            Salvar Ajustes do Mês
          </button>
        </div>
      </div>
    </div>
  );
};
