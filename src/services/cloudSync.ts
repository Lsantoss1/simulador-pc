import { getSupabaseClient, getStoredSupabaseConfig, isCloudConfigured } from './supabase';
import type { Scenario } from '../types/tax';

export type SyncStatus = 'offline' | 'syncing' | 'synced' | 'error';

export const pushScenarioToCloud = async (scenario: Scenario): Promise<boolean> => {
  if (!isCloudConfigured()) return false;
  const client = getSupabaseClient();
  if (!client) return false;

  const { accessKey } = getStoredSupabaseConfig();

  try {
    const payload = {
      id: scenario.id,
      access_key: accessKey,
      name: scenario.name,
      company_name: scenario.companyName,
      cnpj: scenario.cnpj || null,
      initial_stock_pis: scenario.initialStockPIS,
      initial_stock_cofins: scenario.initialStockCOFINS,
      months: scenario.months,
      updated_at: new Date().toISOString(),
    };

    const { error } = await client
      .from('simulacoes')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error('Erro ao enviar cenário para o Supabase:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exceção ao sincronizar cenário na nuvem:', err);
    return false;
  }
};

export const pushAllScenariosToCloud = async (scenarios: Scenario[]): Promise<boolean> => {
  if (!isCloudConfigured() || scenarios.length === 0) return false;
  const client = getSupabaseClient();
  if (!client) return false;

  const { accessKey } = getStoredSupabaseConfig();

  try {
    const records = scenarios.map((s) => ({
      id: s.id,
      access_key: accessKey,
      name: s.name,
      company_name: s.companyName,
      cnpj: s.cnpj || null,
      initial_stock_pis: s.initialStockPIS,
      initial_stock_cofins: s.initialStockCOFINS,
      months: s.months,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await client
      .from('simulacoes')
      .upsert(records, { onConflict: 'id' });

    if (error) {
      console.error('Erro ao enviar múltiplos cenários:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exceção ao enviar múltiplos cenários:', err);
    return false;
  }
};

export const fetchScenariosFromCloud = async (): Promise<Scenario[] | null> => {
  if (!isCloudConfigured()) return null;
  const client = getSupabaseClient();
  if (!client) return null;

  const { accessKey } = getStoredSupabaseConfig();

  try {
    const { data, error } = await client
      .from('simulacoes')
      .select('*')
      .eq('access_key', accessKey)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Erro ao baixar dados do Supabase:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return [];
    }

    const scenarios: Scenario[] = data.map((row: any) => ({
      id: row.id,
      name: row.name,
      companyName: row.company_name,
      cnpj: row.cnpj || '',
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
      initialStockPIS: Array.isArray(row.initial_stock_pis) ? row.initial_stock_pis : [],
      initialStockCOFINS: Array.isArray(row.initial_stock_cofins) ? row.initial_stock_cofins : [],
      months: Array.isArray(row.months) ? row.months : [],
    }));

    return scenarios;
  } catch (err) {
    console.error('Exceção ao buscar cenários do Supabase:', err);
    return null;
  }
};

export const deleteScenarioFromCloud = async (id: string): Promise<boolean> => {
  if (!isCloudConfigured()) return false;
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client
      .from('simulacoes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir do Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Exceção ao excluir do Supabase:', err);
    return false;
  }
};
