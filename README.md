# Simulador de Controle de Créditos a Transportar (PIS e COFINS)

[![GitHub Repo](https://img.shields.io/badge/GitHub-simulador--pc-blue?logo=github)](https://github.com/Lsantoss1/simulador-pc)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase)](https://supabase.com/)

Aplicação web desenvolvida para a simulação e controle contábil/fiscal de créditos acumulados de **PIS** e **COFINS** no regime não-cumulativo, aplicando o método oficial **PEPS / FIFO** (Primeiro que Entra, Primeiro que Sai) conforme os **Blocos 1100 (PIS)** e **1500 (COFINS)** da **EFD-Contribuições** e normativas da Receita Federal do Brasil.

---

## 🚀 Repositório GitHub

O código-fonte completo está publicado e versionado no repositório:
👉 **[https://github.com/Lsantoss1/simulador-pc](https://github.com/Lsantoss1/simulador-pc)**

---

## 💻 Como Iniciar o Aplicativo Localmente

### Opção 1: Duplo clique (Mais fácil no Windows)
Basta dar um duplo clique no arquivo:
👉 `iniciar-simulador.bat`

Ele abrirá automaticamente o navegador em `http://localhost:5173`.

### Opção 2: Pelo Terminal
```bash
npm install
npm run dev
```

---

## ☁️ Banco de Dados na Nuvem (Supabase)

O simulador possui integração nativa com o **Supabase** via variáveis de ambiente no arquivo `.env`:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-publica-anon
```

### Script SQL para Criar a Tabela no Supabase
Execute o script abaixo no **SQL Editor** do seu painel do Supabase:

```sql
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

ALTER TABLE public.simulacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso com chave da empresa"
ON public.simulacoes FOR ALL
USING (true) WITH CHECK (true);
```

---

## ✨ Principais Funcionalidades

1. **Entrada Mensal Simples e Rápida**:
   - Insira os valores apurados em R$ de Débitos e Créditos de cada mês para PIS e COFINS.
   - Botão para adicionar meses individuais ou preencher sequências de **+6 Meses**.
   - Importação e exportação de dados via planilhas **Excel (.xlsx / .csv)**.

2. **Cálculo Contábil PEPS / FIFO**:
   - Abatimento automático consumindo prioritariamente os créditos mais antigos em estoque.
   - Cálculo preciso do **Saldo a Transportar** para os períodos subsequentes.
   - Cálculo imediato de **Imposto a Recolher (DARF)** caso os débitos superem os créditos acumulados.

3. **Rastreamento Exato das Sobras por Mês de Origem**:
   - Responde com exatidão à pergunta: *"Sobrou crédito referente a qual mês e quanto foi?"*.
   - Detalhamento expansível para cada competência, discriminando cada parcela restante e o mês/ano em que ela foi originalmente gerada.
   - Memória de consumo demonstrando de quais lotes antigos foram abatidos os débitos do mês.

4. **Alertas Visuais de Prescrição Tributária (5 Anos / 60 Meses)**:
   - 🟢 **Vigente** (< 36 meses)
   - 🟡 **Atenção** (36 a 47 meses)
   - 🟠 **Crítico** (48 a 59 meses - risco iminente de perda)
   - 🔴 **Prescrito** (≥ 60 meses - perda do direito creditório quinquenal)

5. **Estoque Inicial de Créditos**:
   - Cadastre saldos credores de períodos anteriores já existentes (ex: originados de escriturações anteriores) para compor a fila inicial PEPS.

6. **Múltiplos Cenários / Empresas & Sincronização**:
   - Crie, renomeie, duplique e alterne entre diferentes clientes ou cenários de simulação tributária.
   - Salvamento automático contínuo local e sincronização automática em nuvem (multi-dispositivo).

7. **Relatórios e Exportação**:
   - Exportação completa em **Excel (.xlsx)** com abas de PIS, COFINS, Estoque Inicial e Composição.
   - Botão **Imprimir / PDF** para geração de laudo fiscal formatado e pronto para entrega.

---

## 🏛️ Fundamentação Legal
- Leis nº 10.637/2002 (PIS Não-Cumulativo) e nº 10.833/2003 (COFINS Não-Cumulativa);
- Instrução Normativa RFB nº 2.121/2022;
- Manual de Orientação do Leiaute da EFD-Contribuições (Bloco 1100 e Bloco 1500 - Controle de Créditos Fiscais).
