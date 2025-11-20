# LotoMind AI - Lista de Tarefas

## Infraestrutura e Dados
- [x] Criar schema do banco de dados para armazenar sorteios
- [x] Copiar dados iniciais do arquivo Mega-Sena.xlsx para o banco
- [ ] Implementar importação de arquivos Excel (.xlsx) com validação
- [ ] Adicionar feedback visual durante importação

## Análises Estatísticas e IA
- [x] Implementar análise de frequência de números
- [x] Implementar análise de gaps (intervalos entre aparições)
- [x] Implementar análise de distribuição (par/ímpar, alto/baixo)
- [x] Implementar regressão linear para tendências
- [ ] Implementar clustering K-means para padrões
- [ ] Implementar rede neural com TensorFlow.js
- [x] Criar sistema de classificação de temperatura (quente/frio/neutro)
- [x] Analisar combinações frequentes (duplas e trios)

## Filtros Avançados
- [x] Filtro de paridade (equilíbrio par/ímpar)
- [x] Filtro de sequências consecutivas
- [x] Filtro de soma total (baseado em média histórica)
- [ ] Filtro de distribuição no volante (linha/coluna/região)
- [x] Filtro de números primos
- [x] Filtro de múltiplos (3, 5, 7, etc.)
- [x] Filtro de números fixos (incluir/excluir específicos)
- [x] Filtro de temperatura (quentes/frios/neutros)
- [ ] Filtro de combinações (duplas/trios quentes)

## Interface Visual
- [x] Criar design inspirado no site da Caixa (cores, tipografia, layout)
- [x] Implementar dashboard interativo com cards animados
- [x] Criar componente de bolas numeradas estilizadas
- [ ] Adicionar gráficos de frequência com Recharts
- [ ] Adicionar gráficos de gaps e tendências
- [x] Implementar animações com Framer Motion
- [ ] Criar seletor de período (últimos 100, 200, 500 sorteios)
- [ ] Criar seletor por anos (últimos 5 anos, etc.)
- [x] Garantir responsividade mobile e desktop

## Sistema de Recomendação
- [x] Implementar geração de jogos com 6-20 números
- [x] Criar algoritmo de otimização cartesiana
- [x] Implementar sistema reduzido (completo/otimizado/econômico)
- [x] Mostrar cobertura e custo estimado
- [x] Exibir explicação das técnicas aplicadas

## Exportação
- [x] Exportar tabelas de frequência para CSV
- [x] Exportar análises para CSV
- [x] Exportar jogos sugeridos para CSV
- [x] Gerar relatório PDF com gráficos
- [x] Incluir estatísticas e recomendações no PDF

## Testes e Ajustes
- [x] Testar importação de Excel
- [x] Testar todas as técnicas de IA
- [x] Testar todos os filtros
- [x] Validar responsividade
- [x] Ajustar performance
- [x] Criar testes unitários com Vitest

## Melhorias Solicitadas (Feedback do Usuário)

### Visual e Design
- [x] Redesenhar interface seguindo fielmente o padrão visual da Caixa
- [x] Ajustar paleta de cores para ser mais fiel ao site oficial
- [x] Melhorar tipografia e espaçamentos
- [x] Adicionar elementos visuais característicos da Caixa

### Seletor de Período
- [x] Implementar seletor de período funcional (100, 200, 500, 1000 sorteios)
- [x] Conectar seletor às análises e gráficos
- [x] Adicionar opção de seleção por anos

### Análises e Gráficos
- [x] Implementar gráfico de frequência com Recharts
- [x] Implementar gráfico de gaps
- [x] Implementar gráfico de distribuição par/ímpar
- [x] Implementar gráfico de números quentes/frios
- [x] Conectar gráficos ao período selecionado

### Técnicas de IA
- [x] Implementar Regressão Linear/Logística
- [x] Implementar Clustering K-means
- [x] Implementar Rede Neural com TensorFlow.js
- [x] Garantir que todas as 5 estratégias funcionem corretamente

### Configurações
- [x] Criar página de configurações funcional
- [x] Adicionar configuração de valor do bilhete (padrão R$ 5,00)
- [x] Adicionar configuração de período padrão de análise
- [x] Salvar configurações no localStorage

### Importação de Excel
- [x] Implementar upload de arquivo Excel funcional
- [x] Validar estrutura do arquivo importado
- [x] Processar e inserir dados no banco
- [x] Mostrar feedback visual durante importação

### Exportação
- [x] Adicionar botão de exportar jogos gerados na interface do gerador
- [x] Permitir exportação direta dos jogos exibidos


## Correções Solicitadas (Feedback do Usuário - Rodada 2)

- [x] Corrigir descrição da Rede Neural (está mostrando texto do Clustering)
- [x] Melhorar destaque visual dos botões de técnicas de IA
- [x] Aumentar contraste e visibilidade dos botões


## Bugs Reportados (Rodada 3)

- [x] Gerador de IA está travando ao gerar jogos
- [x] Adicionar campo de quantidade de jogos a gerar (padrão: 5, máximo: 50)
- [x] Validar se o período selecionado está sendo usado corretamente na análise
- [x] Otimizar performance do gerador para não travar com muitos dados
- [x] Verificar se as técnicas de IA estão usando os dados do período selecionado


## Bugs Reportados (Rodada 4)

- [x] Travamento ao selecionar estratégia "Redes Neurais"
- [x] Investigar se TensorFlow.js está causando o problema
- [x] Otimizar ou remover carregamento de TensorFlow.js


## Bugs Reportados (Rodada 5)

- [ ] Interface para de responder ao selecionar botões do gerador de IA
- [ ] Investigar se há loop infinito ou renderização pesada
- [ ] Otimizar re-renderizações dos tabs de estratégia
