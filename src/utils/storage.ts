import type { Scenario } from '../types/tax';

const STORAGE_KEY = 'simulador_pis_cofins_scenarios_v1';
const ACTIVE_SCENARIO_KEY = 'simulador_pis_cofins_active_id_v1';

export const createDefaultScenario = (): Scenario => {
  return {
    id: 'cenario-padrao-demo',
    name: 'Simulação Exemplo - Ano 2024',
    companyName: 'Empresa Modelo Ltda',
    cnpj: '12.345.678/0001-90',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    initialStockPIS: [
      { id: 'pis-init-1', originPeriod: '2023-10', amount: 15400.00, notes: 'Saldo credor EFD Out/2023' },
      { id: 'pis-init-2', originPeriod: '2023-11', amount: 8900.50, notes: 'Saldo credor EFD Nov/2023' },
      { id: 'pis-init-3', originPeriod: '2023-12', amount: 12200.00, notes: 'Saldo credor EFD Dez/2023' },
    ],
    initialStockCOFINS: [
      { id: 'cofins-init-1', originPeriod: '2023-10', amount: 71000.00, notes: 'Saldo credor EFD Out/2023' },
      { id: 'cofins-init-2', originPeriod: '2023-11', amount: 41050.20, notes: 'Saldo credor EFD Nov/2023' },
      { id: 'cofins-init-3', originPeriod: '2023-12', amount: 56250.00, notes: 'Saldo credor EFD Dez/2023' },
    ],
    months: [
      {
        id: 'm-2024-01',
        period: '2024-01',
        pisDebit: 18000.00,
        pisCredit: 9500.00,
        cofinsDebit: 83000.00,
        cofinsCredit: 43800.00,
        notes: 'Competência regular Jan/2024',
      },
      {
        id: 'm-2024-02',
        period: '2024-02',
        pisDebit: 14500.00,
        pisCredit: 11200.00,
        cofinsDebit: 66800.00,
        cofinsCredit: 51600.00,
        notes: 'Competência regular Fev/2024',
      },
      {
        id: 'm-2024-03',
        period: '2024-03',
        pisDebit: 25000.00,
        pisCredit: 8200.00,
        cofinsDebit: 115000.00,
        cofinsCredit: 37800.00,
        notes: 'Pico de vendas Mar/2024',
      },
      {
        id: 'm-2024-04',
        period: '2024-04',
        pisDebit: 12000.00,
        pisCredit: 19500.00,
        cofinsDebit: 55300.00,
        cofinsCredit: 89900.00,
        notes: 'Aquisições de insumos Abr/2024',
      },
      {
        id: 'm-2024-05',
        period: '2024-05',
        pisDebit: 16800.00,
        pisCredit: 14200.00,
        cofinsDebit: 77450.00,
        cofinsCredit: 65400.00,
        notes: 'Competência regular Mai/2024',
      },
      {
        id: 'm-2024-06',
        period: '2024-06',
        pisDebit: 21000.00,
        pisCredit: 10500.00,
        cofinsDebit: 96800.00,
        cofinsCredit: 48400.00,
        notes: 'Competência regular Jun/2024',
      }
    ],
  };
};

export const loadScenarios = (): Scenario[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaultScn = createDefaultScenario();
      saveScenarios([defaultScn]);
      setActiveScenarioId(defaultScn.id);
      return [defaultScn];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const defaultScn = createDefaultScenario();
    return [defaultScn];
  } catch (err) {
    console.error('Falha ao carregar cenários do localStorage:', err);
    return [createDefaultScenario()];
  }
};

export const saveScenarios = (scenarios: Scenario[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
  } catch (err) {
    console.error('Falha ao salvar cenários no localStorage:', err);
  }
};

export const getActiveScenarioId = (): string => {
  try {
    return localStorage.getItem(ACTIVE_SCENARIO_KEY) || 'cenario-padrao-demo';
  } catch {
    return 'cenario-padrao-demo';
  }
};

export const setActiveScenarioId = (id: string): void => {
  try {
    localStorage.setItem(ACTIVE_SCENARIO_KEY, id);
  } catch (err) {
    console.error('Falha ao salvar id do cenário ativo:', err);
  }
};
