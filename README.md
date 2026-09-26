# Simulador de Controle de Créditos a Transportar (PIS e COFINS)

Aplicação web desenvolvida para a simulação e controle contábil/fiscal de créditos acumulados de **PIS** e **COFINS** no regime não-cumulativo, aplicando o método oficial **PEPS / FIFO** (Primeiro que Entra, Primeiro que Sai) conforme os **Blocos 1100 (PIS)** e **1500 (COFINS)** da **EFD-Contribuições** e normativas da Receita Federal do Brasil.

---

## 🚀 Como Iniciar o Aplicativo

### Opção 1: Duplo clique (Mais fácil no Windows)
Basta dar um duplo clique no arquivo:
👉 `iniciar-simulador.bat`

Ele abrirá automaticamente o navegador em `http://localhost:5173`.

### Opção 2: Pelo Terminal
```bash
npm run dev
```
Abra o link informado no terminal (geralmente [http://localhost:5173](http://localhost:5173)).

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

6. **Múltiplos Cenários / Empresas**:
   - Crie, renomeie, duplique e alterne entre diferentes clientes ou cenários de simulação tributária.
   - Salvamento automático contínuo no navegador (`localStorage`).

7. **Relatórios e Exportação**:
   - Exportação completa em **Excel (.xlsx)** com abas de PIS, COFINS, Estoque Inicial e Composição.
   - Botão **Imprimir / PDF** para geração de laudo fiscal formatado e pronto para entrega.

---

## 🏛️ Fundamentação Legal
- Leis nº 10.637/2002 (PIS Não-Cumulativo) e nº 10.833/2003 (COFINS Não-Cumulativa);
- Instrução Normativa RFB nº 2.121/2022;
- Manual de Orientação do Leiaute da EFD-Contribuições (Bloco 1100 e Bloco 1500 - Controle de Créditos Fiscais).
