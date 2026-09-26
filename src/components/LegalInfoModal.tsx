import React from 'react';
import { X, Scale, FileText, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const LegalInfoModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Regras Fiscais & Fundamentação Legal
              </h2>
              <p className="text-xs text-slate-500">
                Critérios da EFD-Contribuições e Receita Federal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-slate-600 leading-relaxed max-h-[60vh] overflow-y-auto">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              1. Método PEPS / FIFO (Blocos 1100 e 1500)
            </h4>
            <p>
              Na apuração da EFD-Contribuições, os débitos do mês compensam prioritariamente os saldos credores mais antigos acumulados. Esse critério evita que créditos antigos expirem antes dos mais novos.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              2. Prazo Quinquenal de Prescrição (60 Meses)
            </h4>
            <p>
              Conforme o Decreto nº 20.910/1932 e a IN RFB nº 2.121/2022, o direito de pleitear ou aproveitar créditos decorrentes de apuração não-cumulativa extingue-se em 5 anos (60 meses) contados do encerramento do período de apuração correspondente.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-amber-600" />
              3. Legislação de Referência
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-500 pt-1">
              <li>Lei nº 10.637/2002 (Regime Não-Cumulativo do PIS/Pasep);</li>
              <li>Lei nº 10.833/2003 (Regime Não-Cumulativo da COFINS);</li>
              <li>Instrução Normativa RFB nº 2.121/2022;</li>
              <li>Manual do Leiaute da EFD-Contribuições (Blocos M200/M600 e 1100/1500).</li>
            </ul>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-sm"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
