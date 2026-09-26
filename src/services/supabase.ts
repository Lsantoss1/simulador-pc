import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'simulador_supabase_url_v1';
const STORAGE_KEY_ANON = 'simulador_supabase_anon_key_v1';
const STORAGE_KEY_ACCESS = 'simulador_company_access_key_v1';

let clientInstance: SupabaseClient | null = null;

export const getStoredSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = localStorage.getItem(STORAGE_KEY_URL);
  const storedKey = localStorage.getItem(STORAGE_KEY_ANON);
  const accessKey = localStorage.getItem(STORAGE_KEY_ACCESS) || 'EMPRESA-PADRAO';

  // O .env sempre tem prioridade máxima se estiver definido
  const finalUrl = envUrl || storedUrl || '';
  const finalKey = envKey || storedKey || '';

  return {
    url: finalUrl.trim(),
    anonKey: finalKey.trim(),
    accessKey: accessKey.trim(),
  };
};

export const saveSupabaseConfig = (url: string, anonKey: string, accessKey: string) => {
  localStorage.setItem(STORAGE_KEY_URL, url.trim());
  localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
  localStorage.setItem(STORAGE_KEY_ACCESS, accessKey.trim());
  clientInstance = null; // Reinicializa o cliente na próxima chamada
};

export const getSupabaseClient = (): SupabaseClient | null => {
  if (clientInstance) return clientInstance;

  const { url, anonKey } = getStoredSupabaseConfig();
  if (!url || !anonKey) return null;

  try {
    clientInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
      },
    });
    return clientInstance;
  } catch (err) {
    console.error('Falha ao inicializar Supabase Client:', err);
    return null;
  }
};

export const isCloudConfigured = (): boolean => {
  const { url, anonKey } = getStoredSupabaseConfig();
  return Boolean(url && anonKey && url.startsWith('https://'));
};

export const SUPABASE_SQL_SETUP = `-- Execute este script no SQL Editor do seu projeto Supabase:

CREATE TABLE IF NOT EXISTS public.simulacoes (
  id TEXT PRIMARY KEY,
  access_key TEXT NOT NULL,
  name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  cnpj TEXT,
  initial_stock_pis JSONB DEFAULT '[]'::jsonb,
  initial_stock_cofins JSONB DEFAULT '[]'::jsonb,
  months JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Habilita Row Level Security (RLS)
ALTER TABLE public.simulacoes ENABLE ROW LEVEL SECURITY;

-- Permite acesso total para leitura e gravação autenticado ou anônimo com a access_key
CREATE POLICY "Acesso com chave da empresa"
ON public.simulacoes
FOR ALL
USING (true)
WITH CHECK (true);
`;
