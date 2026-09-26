import React, { useRef } from 'react';
import type { MonthlyInput } from '../types/tax';
import { formatCurrency, formatPeriodShort, getNextPeriod } from '../utils/formatters';
import { Plus, Trash2, Upload, Download, Sparkles, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Props {
  months: MonthlyInput[];
  onChange: (months: MonthlyInput[]) => void;
  onDownloadTemplate: () => void;
}

export const MonthlyInputTable: React.FC<Props> = ({ months, onChange, onDownloadTemplate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdate = (id: string, field: keyof MonthlyInput, value: any) => {
    const updated = months.map((m) => {
      if (m.id === id) {
        return { ...m, [field]: value };
      }
      return m;
    });
    onChange(updated);
  };

  const handleAddMonth = () => {
    const lastPeriod = months.length > 0 ? months[months.length - 1].period : '2023-12';
    const nextPer = getNextPeriod(lastPeriod);
    const newMonth: MonthlyInput = {
      id: `m-${Date.now()}-${nextPer}`,
      period: nextPer,
      pisDebit: 0,
      pisCredit: 0,
      cofinsDebit: 0,
      cofinsCredit: 0,
      notes: '',
    };
    onChange([...months, newMonth]);
  };

  const handleAddSixMonths = () => {
    let lastPeriod = months.length > 0 ? months[months.length - 1].period : '2023-12';
    const newMonths: MonthlyInput[] = [];

    for (let i = 0; i < 6; i++) {
      lastPeriod = getNextPeriod(lastPeriod);
      newMonths.push({
        id: `m-${Date.now()}-${i}-${lastPeriod}`,
        period: lastPeriod,
        pisDebit: 0,
        pisCredit: 0,
        cofinsDebit: 0,
        cofinsCredit: 0,
        notes: `Simulação ${formatPeriodShort(lastPeriod)}`,
      });
    }

    onChange([...months, ...newMonths]);
  };

  const handleDeleteMonth = (id: string) => {
    onChange(months.filter((m) => m.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os meses da simulação atual?')) {
      onChange([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        // Procura linha de cabeçalho
        const parsedMonths: MonthlyInput[] = [];
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length === 0 || !row[0]) continue;

          let period = String(row[0]).trim();
          // Normaliza se for MM/AAAA ou AAAA-MM
          if (period.includes('/')) {
            const [m, y] = period.split('/');
            period = `${y}-${m.padStart(2, '0')}`;
          }

          const pisDebit = parseFloat(String(row[1] || '0').replace(',', '.')) || 0;
          const pisCredit = parseFloat(String(row[2] || '0').replace(',', '.')) || 0;
          const cofinsDebit = parseFloat(String(row[3] || '0').replace(',', '.')) || 0;
          const cofinsCredit = parseFloat(String(row[4] || '0').replace(',', '.')) || 0;
          const notes = row[5] ? String(row[5]) : '';

          parsedMonths.push({
            id: `import-${Date.now()}-${i}`,
            period,
            pisDebit,
            pisCredit,
            cofinsDebit,
            cofinsCredit,
            notes,
          });
        }

        if (parsedMonths.length > 0) {
          onChange(parsedMonths);
          alert(`${parsedMonths.length} meses importados com sucesso!`);
        } else {
          alert('Nenhum dado válido encontrado na planilha importada.');
        }
      } catch (err) {
        console.error(err);
        alert('Erro ao ler arquivo da planilha. Verifique o formato do modelo.');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const totalPisDebit = months.reduce((s, m) => s + m.pisDebit, 0);
  const totalPisCredit = months.reduce((s, m) => s + m.pisCredit, 0);
  const totalCofinsDebit = months.reduce((s, m) => s + m.cofinsDebit, 0);
  const totalCofinsCredit = months.reduce((s, m) => s + m.cofinsCredit, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Table Header & Controls */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-800">
              Lançamentos Mensais de Débitos e Créditos
            </h3>
            <span className="bg-indigo-100 text-indigo-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              {months.length} {months.length === 1 ? 'mês cadastrado' : 'meses cadastrados'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Insira os valores apurados de cada competência para alimentar o motor PEPS
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx,.xls,.csv"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm transition-colors"
            title="Importar planilha XLSX com os meses"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            Importar Excel
          </button>

          <button
            onClick={onDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm transition-colors"
            title="Baixar planilha modelo para preenchimento"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Modelo Excel
          </button>

          <button
            onClick={handleAddSixMonths}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg shadow-sm transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            +6 Meses
          </button>

          <button
            onClick={handleAddMonth}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar Mês
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-32">Competência</th>
              <th className="py-3 px-4 text-right bg-indigo-50/40 text-indigo-900 border-l border-indigo-100">
                Débito PIS (R$)
              </th>
              <th className="py-3 px-4 text-right bg-indigo-50/40 text-indigo-900">
                Crédito PIS (R$)
              </th>
              <th className="py-3 px-4 text-right bg-emerald-50/40 text-emerald-900 border-l border-emerald-100">
                Débito COFINS (R$)
              </th>
              <th className="py-3 px-4 text-right bg-emerald-50/40 text-emerald-900">
                Crédito COFINS (R$)
              </th>
              <th className="py-3 px-4">Identificação / Detalhes</th>
              <th className="py-3 px-3 text-center w-12">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {months.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  Nenhum mês cadastrado. Clique em <strong>"Adicionar Mês"</strong> ou <strong>"+6 Meses"</strong> para começar.
                </td>
              </tr>
            ) : (
              months.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-700">
                    <input
                      type="month"
                      value={m.period}
                      onChange={(e) => handleUpdate(m.id, 'period', e.target.value)}
                      className="px-2 py-1 border border-slate-200 rounded font-semibold text-xs text-slate-800 bg-white focus:ring-1 focus:ring-indigo-500"
                    />
                  </td>

                  {/* PIS Débito */}
                  <td className="py-2.5 px-4 text-right bg-indigo-50/15 border-l border-slate-100">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={m.pisDebit === 0 ? '' : m.pisDebit}
                      placeholder="0,00"
                      onChange={(e) =>
                        handleUpdate(m.id, 'pisDebit', parseFloat(e.target.value) || 0)
                      }
                      className="w-28 text-right px-2 py-1 border border-slate-200 rounded text-xs font-mono text-slate-800 bg-white focus:ring-1 focus:ring-indigo-500"
                    />
                  </td>

                  {/* PIS Crédito */}
                  <td className="py-2.5 px-4 text-right bg-indigo-50/15">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={m.pisCredit === 0 ? '' : m.pisCredit}
                      placeholder="0,00"
                      onChange={(e) =>
                        handleUpdate(m.id, 'pisCredit', parseFloat(e.target.value) || 0)
                      }
                      className="w-28 text-right px-2 py-1 border border-slate-200 rounded text-xs font-mono text-emerald-700 font-semibold bg-white focus:ring-1 focus:ring-indigo-500"
                    />
                  </td>

                  {/* COFINS Débito */}
                  <td className="py-2.5 px-4 text-right bg-emerald-50/15 border-l border-slate-100">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={m.cofinsDebit === 0 ? '' : m.cofinsDebit}
                      placeholder="0,00"
                      onChange={(e) =>
                        handleUpdate(m.id, 'cofinsDebit', parseFloat(e.target.value) || 0)
                      }
                      className="w-28 text-right px-2 py-1 border border-slate-200 rounded text-xs font-mono text-slate-800 bg-white focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>

                  {/* COFINS Crédito */}
                  <td className="py-2.5 px-4 text-right bg-emerald-50/15">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={m.cofinsCredit === 0 ? '' : m.cofinsCredit}
                      placeholder="0,00"
                      onChange={(e) =>
                        handleUpdate(m.id, 'cofinsCredit', parseFloat(e.target.value) || 0)
                      }
                      className="w-28 text-right px-2 py-1 border border-slate-200 rounded text-xs font-mono text-emerald-700 font-semibold bg-white focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>

                  {/* Observações */}
                  <td className="py-2.5 px-4">
                    <input
                      type="text"
                      value={m.notes || ''}
                      placeholder="Ex: Vendas normais, importações..."
                      onChange={(e) => handleUpdate(m.id, 'notes', e.target.value)}
                      className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-slate-600 bg-white focus:ring-1 focus:ring-indigo-500"
                    />
                  </td>

                  {/* Ação */}
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => handleDeleteMonth(m.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                      title="Excluir este mês"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {/* Totais do rodapé */}
          {months.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold text-slate-700 text-xs">
                <td className="py-3 px-4">TOTAIS APURADOS</td>
                <td className="py-3 px-4 text-right font-mono text-indigo-900 border-l border-slate-200">
                  {formatCurrency(totalPisDebit)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-indigo-700">
                  {formatCurrency(totalPisCredit)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-emerald-900 border-l border-slate-200">
                  {formatCurrency(totalCofinsDebit)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-emerald-700">
                  {formatCurrency(totalCofinsCredit)}
                </td>
                <td colSpan={2} className="py-3 px-4 text-right text-slate-400 font-normal">
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-slate-400 hover:text-red-600 underline"
                  >
                    Limpar todos os meses
                  </button>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
