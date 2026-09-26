import React, { useState, useEffect } from 'react';
import {
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  isCloudConfigured,
  SUPABASE_SQL_SETUP,
} from '../services/supabase';
import { Cloud, X, Key, Database, Copy, Check, RefreshCw, ExternalLink, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onManualSync: () => Promise<void>;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
}

export const CloudSyncModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onManualSync,
  isSyncing,
  lastSyncedAt,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = getStoredSupabaseConfig();
      setUrl(cfg.url);
      setAnonKey(cfg.anonKey);
      setAccessKey(cfg.accessKey);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConfigured = isCloudConfigured();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(url, anonKey, accessKey);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl text-white ${isConfigured ? 'bg-emerald-600' : 'bg-slate-700'}`}>
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Sincronização em Nuvem (Multi-Dispositivo)
              </h2>
              <p className="text-xs text-slate-500">
                Acesse suas simulações de qualquer computador, tablet ou celular
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

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Status Atual */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            isConfigured ? 'bg-emerald-50/70 border-emerald-200' : 'bg-amber-50/70 border-amber-200'
          }`}>
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full animate-pulse ${
                isConfigured ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
              <div>
                <div className="text-xs font-bold text-slate-800">
                  {isConfigured ? 'Conectado à Nuvem (Supabase)' : 'Modo Offline / Local'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {isConfigured
                    ? lastSyncedAt
                      ? `Última sincronização: ${lastSyncedAt.toLocaleTimeString('pt-BR')}`
                      : 'Pronto para sincronizar dados em tempo real'
                    : 'Os dados estão salvos apenas na memória do seu navegador neste computador.'}
                </div>
              </div>
            </div>

            {isConfigured && (
              <button
                type="button"
                onClick={onManualSync}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-white border border-emerald-300 rounded-lg shadow-sm hover:bg-emerald-100 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
              </button>
            )}
          </div>

          {/* Form de Configuração */}
          <form onSubmit={handleSave} className="space-y-4">
            {/* Chave da Empresa / Workspace */}
            <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-600" />
                  Código de Acesso da Sua Empresa
                </label>
                <span className="text-[10px] text-indigo-600 font-medium">Multi-Dispositivo</span>
              </div>
              <input
                type="text"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value.toUpperCase())}
                placeholder="Ex: MARMORARIA-2024 ou SEU-CNPJ"
                className="w-full px-3 py-2 text-sm font-mono font-bold tracking-wider border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                required
              />
              <p className="text-[11px] text-slate-500 leading-tight">
                💡 <strong>Como funciona:</strong> Ao acessar o link do aplicativo em outro computador ou celular, basta digitar exatamente esse mesmo código para carregar automaticamente todas as suas simulações!
              </p>
            </div>

            {/* Credenciais do Supabase */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-slate-500" />
                  Conexão com o Supabase (PostgreSQL)
                </span>
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1"
                >
                  Criar conta gratuita no Supabase <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Project URL
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://xyzproject.supabase.co"
                  className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Project API Key (Anon / Public Key)
                </label>
                <input
                  type="password"
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            </div>

            {/* Botão de Salvar Configurações */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setShowSql(!showSql)}
                className="text-xs text-slate-600 hover:text-slate-900 underline"
              >
                {showSql ? 'Ocultar Script SQL' : 'Ver Script SQL para criar a tabela'}
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    Configuração Salva!
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Salvar e Conectar
                  </>
                )}
              </button>
            </div>

            {/* Script SQL Colapsável */}
            {showSql && (
              <div className="mt-3 p-3.5 bg-slate-900 text-slate-200 rounded-xl text-xs space-y-2 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-slate-400">
                    Copie e cole no SQL Editor do Supabase:
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px] text-white transition-colors"
                  >
                    {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedSql ? 'Copiado!' : 'Copiar SQL'}
                  </button>
                </div>
                <pre className="font-mono text-[10px] overflow-x-auto text-emerald-400 bg-slate-950 p-2.5 rounded-lg max-h-36">
                  {SUPABASE_SQL_SETUP}
                </pre>
              </div>
            )}
          </form>
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
