import React, { useState } from 'react';
import type { InitialCreditStock, TaxType } from '../types/tax';
import { formatCurrency, formatPeriodShort } from '../utils/formatters';
import { X, Plus, Trash2, Calendar, FileText, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialStockPIS: InitialCreditStock[];
  initialStockCOFINS: InitialCreditStock[];
  onSave: (pis: InitialCreditStock[], cofins: InitialCreditStock[]) => void;
}

export const InitialStockModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialStockPIS,
  initialStockCOFINS,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<TaxType>('PIS');
  const [pisStocks, setPisStocks] = useState<InitialCreditStock[]>(initialStockPIS);
  const [cofinsStocks, setCofinsStocks] = useState<InitialCreditStock[]>(initialStockCOFINS);

  // Novos campos de entrada rápida
  const [newPeriod, setNewPeriod] = useState('2023-12');
  const [newAmount, setNewAmount] = useState('');
  const [newNotes, setNewNotes] = useState('');

  if (!isOpen) return null;

  const currentList = activeTab === 'PIS' ? pisStocks : cofinsStocks;
  const setCurrentList = (updater: (prev: InitialCreditStock[]) => InitialCreditStock[]) => {
    if (activeTab === 'PIS') {
      setPisStocks(updater);
    } else {
      setCofinsStocks(updater);
    }
  };

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newAmount.replace(/[^\d.,]/g, '').replace(',', '.'));
    if (!newPeriod || isNaN(val) || val <= 0) return;

    const newStock: InitialCreditStock = {
      id: `${activeTab.toLowerCase()}-init-${Date.now()}`,
      originPeriod: newPeriod,
      amount: val,
      notes: newNotes.trim() || `Saldo credor anterior ${formatPeriodShort(newPeriod)}`,
    };

    setCurrentList((prev) => [...prev, newStock]);
    setNewAmount('');
    setNewNotes('');
  };

  const handleRemove = (id: string) => {
    setCurrentList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveAndClose = () => {
    onSave(pisStocks, cofinsStocks);
    onClose();
  };

  const totalPIS = pisStocks.reduce((sum, item) => sum + item.amount, 0);
  const totalCOFINS = cofinsStocks.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Estoque Inicial de Créditos Acumulados
            </h2>
            <p className="text-xs text-slate-500">
              Cadastre saldos credores de períodos anteriores para serem consumidos por PEPS na simulação
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 px-6 pt-3 bg-white">
          <button
            onClick={() => setActiveTab('PIS')}
            className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm border-b-2 transition-all ${
              activeTab === 'PIS'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>PIS (1,65%)</span>
            <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold">
              {formatCurrency(totalPIS)}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('COFINS')}
            className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm border-b-2 transition-all ${
              activeTab === 'COFINS'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>COFINS (7,60%)</span>
            <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-bold">
              {formatCurrency(totalCOFINS)}
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Form de Adicionar Novo Lote */}
          <form
            onSubmit={handleAddStock}
            className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
          >
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-indigo-600" />
              Adicionar Saldo de Mês Anterior ({activeTab})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Mês Origem (AAAA-MM)
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="month"
                    value={newPeriod}
                    onChange={(e) => setNewPeriod(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Valor do Crédito (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Identificação / Nota
                </label>
                <input
                  type="text"
                  placeholder="Ex: EFD Bloco 1100"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Incluir no Estoque
              </button>
            </div>
          </form>

          {/* Lista de Saldos Cadastrados */}
          <div>
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Lotes de Crédito Cadastrados para {activeTab}</span>
              <span className="text-slate-400 font-normal">
                {currentList.length} {currentList.length === 1 ? 'lote' : 'lotes'}
              </span>
            </div>

            {currentList.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                Nenhum saldo inicial cadastrado para {activeTab}. A simulação iniciará do zero ou apenas com os créditos apurados nos meses correntes.
              </div>
            ) : (
              <div className="space-y-2">
                {currentList
                  .sort((a, b) => a.originPeriod.localeCompare(b.originPeriod))
                  .map((stock) => (
                    <div
                      key={stock.id}
                      className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-white hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                          {formatPeriodShort(stock.originPeriod)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800">
                            {formatCurrency(stock.amount)}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1.5">
                            <FileText className="w-3 h-3 text-slate-400" />
                            {stock.notes || 'Sem observações'}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemove(stock.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Remover lote"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            Total Inicial: <strong className="text-slate-800">{formatCurrency(activeTab === 'PIS' ? totalPIS : totalCOFINS)}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveAndClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
