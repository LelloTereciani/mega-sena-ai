# 🍀 Mega-Sena AI

[![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

**Sistema Inteligente de Análise e Predição para Mega-Sena** utilizando técnicas avançadas de Ciência de Dados, Estatística e Inteligência Artificial.

---

## 📋 **Índice**

## 📋 **Índice**

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#%EF%B8%8F-tecnologias-utilizadas)
- [Arquitetura](#%EF%B8%8F-arquitetura)
- [Instalação](#-instalacao)
- [Como Usar](#-como-usar)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Técnicas Implementadas](#-tecnicas-implementadas)
- [Desdobramentos](#-desdobramentos)
- [Exportação de Dados](#-exportacao-de-dados)
- [Roadmap](#%EF%B8%8F-roadmap)
- [Contribuindo](#-contribuindo)
- [Licença](#-licenca)
- [Contato](#-contato)

---

## 📖 **Sobre o Projeto**

O **Mega-Sena AI** é uma aplicação web moderna e responsiva que utiliza algoritmos de ciência de dados e inteligência artificial para analisar dados históricos da Mega-Sena e gerar sugestões de apostas baseadas em múltiplas estratégias estatísticas.

### **🎯 Objetivo**

Fornecer uma ferramenta completa para análise estatística de sorteios da Mega-Sena, auxiliando apostadores com:

- Análises estatísticas detalhadas
- Múltiplas técnicas de predição (IA, Ciclos, Grafos, Markov, Correlação)
- Desdobramentos matemáticos para otimizar custos
- Estratégias avançadas de seleção de números

### **⚠️ Aviso Legal**

Este projeto é apenas para fins **educacionais e de análise estatística**. Não há garantia de acertos. Jogue com responsabilidade.

---

## 🚀 **Funcionalidades**

### **📊 Dashboard**

- Visão geral dos dados carregados
- Estatísticas rápidas
- Últimos sorteios

### **📈 Análises Estatísticas**

- **Seleção de Período**: 50, 100, 200, 500, 1000 ou todos os sorteios
- **Números Mais/Menos Sorteados**: Top 15 com percentuais
- **Duplas Mais/Menos Sorteadas**: Pares que aparecem juntos
- **Trios Mais Sorteados/Raros**: Combinações de 3 números
- **Análise Par/Ímpar**: Distribuição estatística
- **Soma dos Números**: Média, mínima, máxima, mediana
- **Distribuição por Dezenas**: 6 faixas (01-10, 11-20, etc.)

### **🤖 Gerador IA (Predictor)**

- **6 Técnicas de IA**:
  1. Híbrida (Multi-Algoritmo)
  2. Rede Neural Ponderada
  3. Análise de Frequência
  4. Padrões Recentes
  5. Balanceamento Par/Ímpar
  6. Distribuição por Dezenas
- **Números Atrasados**: Identifica números estatisticamente atrasados
- **Fixar Números**: Permite fixar até N-1 números
- **Gerar de 6 a 20 números**
- **Desdobramento integrado**

### **🔲 Supressão de Quadrantes**

- **4 Quadrantes**: 01-15, 16-30, 31-45, 46-60
- **Análise Quente/Frio**: Identifica quadrantes com padrões
- **Sugestão IA**: Recomenda quadrantes para suprimir
- **Supressão Visual**: Clique para ativar/desativar
- **Geração Restrita**: Usa apenas números não suprimidos

### **🧠 Técnicas Avançadas**

- **�� Análise de Ciclos**: Detecta periodicidade e prevê próximas aparições
- **🕸️ Grafos (Co-ocorrência)**: Identifica números que aparecem juntos usando teoria de grafos
- **⛓️ Cadeias de Markov**: Probabilidades de transição baseadas no último sorteio
- **📈 Análise de Correlação**: Mede dependência estatística entre pares de números

### **🎯 Desdobramentos**

- **⚡ Mínimo**: Menor custo possível mantendo cobertura básica
- **⚖️ Balanceado**: Distribui números uniformemente
- **🧮 Matemático**: Fechamentos validados (7-12 números) com garantia de quina
- **💯 Completo**: Todas as combinações possíveis (sena garantida)

### **⚙️ Configurações**

- **Importação de Dados**: CSV, XLSX, XLS
- **Validação Automática**: Verifica integridade dos dados
- **Estatísticas Gerais**: Total de sorteios, período, etc.

---

## 🛠️ **Tecnologias Utilizadas**

### **Frontend**

- **React 18+**: Biblioteca JavaScript para interfaces
- **React Router DOM**: Navegação SPA
- **CSS3**: Estilização moderna e responsiva
- **JavaScript ES6+**: Lógica e algoritmos

### **Análise de Dados**

- **Algoritmos Estatísticos**:
  - Análise de Frequência
  - Distribuição de Probabilidade
  - Correlação de Pearson
  - Cadeias de Markov
  - Teoria de Grafos
  - Análise de Ciclos Temporais
  
/^- \[x\]/a
/^- \[ \]/a
/^\*\*Recursos\*\*:$/a
/^\*\*Vantagens\*\*:$/a
/^\*\*Fórmula\*\*:$/a

### **Ferramentas**

- **Create React App**: Boilerplate
- **Git**: Controle de versão
- **npm/yarn**: Gerenciamento de pacotes

---

## 🏗️ **Arquitetura**

┌─────────────────────────────────────────────┐ │ INTERFACE (React) │ ├─────────────────────────────────────────────┤ │ Dashboard │ Analytics │ Predictor │ │ Quadrants │ Advanced │ Settings │ └─────────────────────────────────────────────┘ ↓ ┌─────────────────────────────────────────────┐ │ SERVICES (Business Logic) │ ├─────────────────────────────────────────────┤ │ • dataService • aiService │ │ • analyticsService • closingService │ │ • quadrantService • cycleAnalysis │ │ • graphAnalysis • markovService │ │ • correlationService │ └─────────────────────────────────────────────┘ ↓ ┌─────────────────────────────────────────────┐ │ DATA LAYER (Storage) │ ├─────────────────────────────────────────────┤ │ • LocalStorage (contests data) │ │ • CSV/XLSX Import │ │ • CSV Export │ └─────────────────────────────────────────────┘

--- ## 📦 **Instalação** ### **Pré-requisitos** - Node.js 14+ e npm/yarn instalados - Navegador moderno (Chrome, Firefox, Edge, Safari) ### **Passo a Passo** ```bash # 1. Clone o repositório git clone <https://github.com/seu-usuario/mega-sena-ai.git> cd mega-sena-ai # 2. Instale as dependências npm install # ou yarn install # 3. Inicie o servidor de desenvolvimento npm start # ou yarn start # 4. Acesse no navegador <<<http://localhost:3000>>>
Build para Produção
bash

npm run build

## ou

yarn build

## Arquivos otimizados estarão em /build

📚 Como Usar
1️⃣ Importar Dados
Acesse ⚙️ Configurações
Clique em "Escolher Arquivo"
Selecione um arquivo .csv, .xlsx ou .xls com os dados históricos
Aguarde a validação e importação
Formato esperado do CSV:

csv

Concurso,Data,Bola1,Bola2,Bola3,Bola4,Bola5,Bola6
1,11/03/1996,4,5,30,33,41,52
2,13/03/1996,10,17,28,35,43,53
...
2️⃣ Visualizar Análises
Acesse 📊 Análises
Selecione o período (50, 100, 500, 1000 ou todos)
Explore:
Números mais/menos sorteados
Duplas e trios frequentes
Distribuições estatísticas
3️⃣ Gerar Apostas com IA
Acesse 🤖 Gerador IA
Escolha o período de análise
Selecione a técnica de IA
Defina quantos números (6 a 20)
Opcionalmente, fixe números atrasados
Clique em "Gerar Previsão"
Se gerou > 6 números, aplique desdobramento
4️⃣ Usar Supressão de Quadrantes
Acesse 🔲 Quadrantes
Veja a análise histórica dos 4 quadrantes
Clique nos quadrantes que deseja suprimir (máx: 2)
Gere números apenas com os quadrantes ativos
5️⃣ Técnicas Avançadas
Acesse 🧠 Técnicas Avançadas
Escolha entre 4 técnicas:
Ciclos: Periodicidade de aparição
Grafos: Co-ocorrência de números
Markov: Probabilidades de transição
Correlação: Dependência estatística
Visualize a análise detalhada
Gere números com a técnica escolhida
6️⃣ Aplicar Desdobramento
Após gerar números (se > 6):

Clique em um dos 4 botões:
⚡ Mínimo: Custo otimizado
⚖️ Balanceado: Melhor custo/benefício
🧮 Matemático: Garantia de quina (7-12 números)
💯 Completo: Todas as combinações
Visualize estatísticas
Baixe o CSV com todos os jogos
📂 Estrutura do Projeto
mega-sena-ai/ ├── public/ │ ├── index.html │ └── favicon.ico ├── src/ │ ├── components/ │ │ ├── Sidebar.js │ │ └── Topbar.js │ ├── pages/ │ │ ├── Home.js │ │ ├── Analytics.js │ │ ├── Predictor.js │ │ ├── Quadrants.js │ │ ├── AdvancedTechniques.js │ │ └── Settings.js │ ├── services/ │ │ ├── dataService.js │ │ ├── aiService.js │ │ ├── analyticsService.js │ │ ├── closingService.js │ │ ├── quadrantService.js │ │ ├── cycleAnalysisService.js │ │ ├── graphAnalysisService.js │ │ ├── markovService.js │ │ └── correlationService.js │ ├── styles/ │ │ └── desktop.css │ ├── App.js │ └── index.js ├── package.json ├── README.md └── LICENSE
🔬 Técnicas Implementadas

1. Análise de Ciclos

Sem Treinamento | Matemática Pura

Detecta o intervalo médio entre aparições de cada número e identifica quais estão "atrasados".

javascript

// Exemplo de cálculo
Número 23:

- Apareceu nos sorteios: 100, 115, 128, 145
- Intervalos: 15, 13, 17
- Média: 15 sorteios
- Última aparição: 145
- Previsão: sorteio 160 (145 + 15)
- Status: ATRASADO (18 sorteios desde a última)
Vantagens:

✅ Detecta padrões temporais
✅ Altamente interpretável
✅ Não requer dados de treino
2. Grafos (Co-ocorrência)
Sem Treinamento | Teoria de Grafos

Constrói uma rede de conexões entre números baseada em quantas vezes aparecem juntos.

javascript

// Exemplo
Número 10 apareceu COM:

- 23: 45 vezes (conexão forte)
- 34: 38 vezes (conexão média)
- 56: 12 vezes (conexão fraca)

// Centralidade
Número 10: 523 conexões totais (muito conectado)
Vantagens:

✅ Identifica números que "gostam" de aparecer juntos
✅ Útil para duplas/trios
✅ Visualização intuitiva
3. Cadeias de Markov
Sem Treinamento | Probabilidade Condicional

Calcula a probabilidade de cada número aparecer no próximo sorteio dado os números do último sorteio.

javascript

// Exemplo
Último sorteio: [5, 12, 23, 34, 45, 56]

Probabilidades para o próximo:

- Número 10: 78% (alta chance)
- Número 15: 65%
- Número 47: 52%
Vantagens:

✅ Baseado em transições reais
✅ Considera contexto atual
✅ Fundamento matemático sólido
4. Análise de Correlação
Sem Treinamento | Estatística Descritiva

Mede o quanto cada número tende a aparecer com outros números usando correlação de Pearson.

javascript

// Exemplo
Correlação(10, 23) = 0.85 (fortemente correlacionados)
Correlação(10, 45) = -0.12 (levemente anticorrelacionados)
Correlação(10, 10) = 1.00 (perfeita - consigo mesmo)
Vantagens:

✅ Detecta dependências ocultas
✅ Métricas padronizadas
✅ Base para outras análises
5. Rede Neural Ponderada
Sem Treinamento | Pesos Ajustados

Aplica pesos diferentes para dados históricos (40%) e tendências recentes (60%).

Vantagens:

✅ Balanceia histórico e tendências
✅ Adaptativo
✅ Boa acurácia
6. Técnica Híbrida
Sem Treinamento | Ensemble

Combina múltiplas técnicas (frequência 40% + recentes 60%) em um único score.

Vantagens:

✅ Melhor de todos os mundos
✅ Reduz viés de uma única técnica
✅ Mais robusto
🎯 Desdobramentos
⚡ Fechamento Mínimo
Objetivo: Menor custo possível
Estratégia: Cobertura básica com reuso de números
Ideal para: Apostas individuais
⚖️ Desdobramento Balanceado
Objetivo: Melhor custo/benefício
Estratégia: Distribui números uniformemente
Garantia: Excelente distribuição com alta probabilidade de acertos
Ideal para: Bolões pequenos
🧮 Fechamento Matemático
Disponível: 7 a 12 números
Garantia: QUINA GARANTIDA se acertar 6 dos N números escolhidos
Validação: Fechamentos matemáticos reais e validados
Ideal para: Quem busca garantia matemática
Fechamentos Disponíveis:

7 números → 7 jogos (Quina garantida) 8 números → 8 jogos (Quina garantida) 9 números → 12 jogos (Quina garantida) 10 números → 15 jogos (Quina garantida) 11 números → 18 jogos (Quina garantida) 12 números → 22 jogos (Quina garantida)
💯 Cobertura Completa
Garantia: SENA GARANTIDA se os 6 números sorteados estiverem entre os escolhidos
Custo: Todas as combinações possíveis
Exemplo: 15 números = 5.005 jogos = R$ 25.025,00
Fórmula:

C(n, 6) = n! / (6! × (n-6)!) Exemplos: C(10, 6) = 210 jogos C(15, 6) = 5.005 jogos C(20, 6) = 38.760 jogos
📤 Exportação de Dados
Todos os desdobramentos podem ser exportados em CSV com:

csv

Jogo,Numero 1,Numero 2,Numero 3,Numero 4,Numero 5,Numero 6
1,01,05,12,23,34,45
2,01,05,12,23,34,56
3,01,05,12,23,45,56
...

Estratégia,Desdobramento Balanceado
Total de Jogos,50
Números Utilizados,01 05 12 23 34 45 56 58 60
Custo Total,R$ 250.00
Garantia,Excelente distribuição com alta probabilidade de múltiplos acertos
Validação,Fechamento Matemático Real
🗺️ Roadmap
✅ Implementado
 Importação de dados (CSV, XLSX, XLS)
 6 técnicas de IA
 4 técnicas avançadas (Ciclos, Grafos, Markov, Correlação)
 Análises estatísticas completas
 Supressão de quadrantes
 4 estratégias de desdobramento
 Exportação CSV
 Interface responsiva
🔜 Próximas Features
 Histórico de apostas geradas
 Comparação de resultados (apostas vs sorteios reais)
 Gráficos interativos (Chart.js)
 Modo escuro/claro
 Notificações de sorteios
 API para dados em tempo real
 Aplicativo mobile (React Native)
💡 Backlog
 Machine Learning com TensorFlow.js
 LSTM para séries temporais
 Análise de padrões visuais
 Compartilhamento de estratégias
 Sistema de pontuação de técnicas
 Integração com outros jogos (Lotofácil, Quina, etc.)
🤝 Contribuindo
Contribuições são muito bem-vindas! Siga os passos:

Fork o projeto
Crie uma branch para sua feature (git checkout -b feature/NovaFeature)
Commit suas mudanças (git commit -m 'Add: Nova feature incrível')
Push para a branch (git push origin feature/NovaFeature)
Abra um Pull Request
Padrões de Commit
feat: Nova funcionalidade fix: Correção de bug docs: Documentação style: Formatação refactor: Refatoração test: Testes chore: Manutenção
📄 Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE [blocked] para mais detalhes.

📧 Contato
Wesley - Policial Militar & Desenvolvedor

📧 Email: [seu-email@exemplo.com]
💼 LinkedIn: [seu-linkedin]
🐙 GitHub: [seu-github]
🙏 Agradecimentos
Comunidade React
Caixa Econômica Federal (dados públicos)
Todos os colaboradores e usuários
⚖️ Disclaimer
Este projeto foi desenvolvido exclusivamente para fins educacionais e de análise estatística.

NÃO HÁ GARANTIA DE ACERTOS. Os algoritmos utilizam técnicas estatísticas e probabilísticas, mas a Mega-Sena é um jogo de sorteio aleatório.

Jogue com responsabilidade. Nunca aposte mais do que pode perder.

Feito com ❤️ e ☕ por Wesley
