import React, { useState } from 'react';
import type { Scenario } from '../types/tax';
import { X, Building2, Tag, Copy, Trash2, Plus, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  scenarios: Scenario[];
  activeScenarioId: string;
  onSelectScenario: (id: string) => void;
  onCreateScenario: (name: string, companyName: string, cnpj?: string) => void;
  onDuplicateScenario: (id: string) => void;
  onDeleteScenario: (id: string) => void;
  onUpdateScenarioDetails: (id: string, name: string, companyName: string, cnpj?: string) => void;
}

export const ScenarioModal: React.FC<Props> = ({
  isOpen,
  onClose,
  scenarios,
  activeScenarioId,
  onSelectScenario,
  onCreateScenario,
  onDuplicateScenario,
  onDeleteScenario,
  onUpdateScenarioDetails,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [cnpj, setCnpj] = useState('');

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setName(`Cenário ${scenarios.length + 1}`);
    setCompanyName('Nova Empresa S/A');
    setCnpj('');
    setIsCreating(true);
    setEditingId(null);
  };

  const handleStartEdit = (scn: Scenario) => {
    setEditingId(scn.id);
    setName(scn.name);
    setCompanyName(scn.companyName);
    setCnpj(scn.cnpj || '');
    setIsCreating(false);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !companyName.trim()) return;

    if (isCreating) {
      onCreateScenario(name.trim(), companyName.trim(), cnpj.trim());
      setIsCreating(false);
    } else if (editingId) {
      onUpdateScenarioDetails(editingId, name.trim(), companyName.trim(), cnpj.trim());
      setEditingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Gerenciar Empresas e Cenários
            </h2>
            <p className="text-xs text-slate-500">
              Crie simulações independentes para diferentes clientes ou testes de apuração
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Form de Criação/Edição */}
          {(isCreating || editingId) ? (
            <form onSubmit={handleSaveForm} className="p-4 border border-indigo-200 bg-indigo-50/50 rounded-xl space-y-3">
              <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                {isCreating ? 'Novo Cenário / Empresa' : 'Editar Dados do Cenário'}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nome do Cenário
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Simulação 2024 - Otimizada"
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Razão Social / Empresa
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ex: Indústria XYZ Ltda"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    CNPJ (Opcional)
                  </label>
                  <input
                    type="text"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingId(null);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Salvar Cenário
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={handleStartCreate}
              className="w-full py-2.5 px-4 border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50 rounded-xl text-indigo-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Criar Novo Cenário ou Empresa
            </button>
          )}

          {/* Lista de Cenários */}
          <div className="space-y-2 pt-1">
            {scenarios.map((scn) => {
              const isActive = scn.id === activeScenarioId;
              return (
                <div
                  key={scn.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                    isActive
                      ? 'border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div
                    onClick={() => {
                      onSelectScenario(scn.id);
                      onClose();
                    }}
                    className="flex-1 cursor-pointer pr-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-indigo-500" />
                        {scn.name}
                      </span>
                      {isActive && (
                        <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Ativo
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {scn.companyName} {scn.cnpj ? `(${scn.cnpj})` : ''}
                      </span>
                      <span>• {scn.months.length} meses</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(scn)}
                      className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-md font-medium"
                      title="Editar dados"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDuplicateScenario(scn.id)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                      title="Duplicar cenário"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {scenarios.length > 1 && (
                      <button
                        onClick={() => onDeleteScenario(scn.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Excluir cenário"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg shadow-sm"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
