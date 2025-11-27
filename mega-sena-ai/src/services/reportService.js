class ReportService {
  
  generateHTMLReport(data) {
    const { 
      generatedGames, 
      stats, 
      budget, 
      numbersPerGame, 
      ticketPrice,
      period,
      techniques 
    } = data;

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório - Mega-Sena AI</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background: #f8fafc;
      padding: 2rem;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .header {
      text-align: center;
      margin-bottom: 3rem;
      padding-bottom: 2rem;
      border-bottom: 3px solid #8b5cf6;
    }
    
    .header h1 {
      font-size: 2.5rem;
      color: #8b5cf6;
      margin-bottom: 0.5rem;
    }
    
    .header .subtitle {
      font-size: 1.1rem;
      color: #64748b;
    }
    
    .header .date {
      font-size: 0.9rem;
      color: #94a3b8;
      margin-top: 0.5rem;
    }
    
    .section {
      margin-bottom: 2.5rem;
    }
    
    .section-title {
      font-size: 1.5rem;
      color: #1e293b;
      margin-bottom: 1.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #e2e8f0;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .stat-card {
      padding: 1.5rem;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border-radius: 8px;
      border-left: 4px solid #3b82f6;
      text-align: center;
    }
    
    .stat-label {
      font-size: 0.85rem;
      color: #64748b;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
    }
    
    .stat-extra {
      font-size: 0.8rem;
      color: #64748b;
      margin-top: 0.25rem;
    }
    
    .distribution-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 2rem;
    }
    
    .distribution-table th,
    .distribution-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .distribution-table th {
      background: #f8fafc;
      font-weight: 600;
      color: #475569;
      text-transform: uppercase;
      font-size: 0.85rem;
      letter-spacing: 0.5px;
    }
    
    .distribution-table tr:hover {
      background: #f8fafc;
    }
    
    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 0.5rem;
    }
    
    .progress-fill {
      height: 100%;
      background: #8b5cf6;
      transition: width 0.3s ease;
    }
    
    .games-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .game-card {
      padding: 1.5rem;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    
    .game-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .game-number {
      font-weight: 700;
      font-size: 1.1rem;
      color: #1e293b;
    }
    
    .game-technique {
      font-size: 0.75rem;
      padding: 0.25rem 0.75rem;
      background: #8b5cf6;
      color: white;
      border-radius: 4px;
      font-weight: 600;
    }
    
    .numbers-display {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    
    .number-ball {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      background: #8b5cf6;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1rem;
      box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);
    }
    
    .footer {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 0.9rem;
    }
    
    .disclaimer {
      background: #fef3c7;
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid #f59e0b;
      margin-top: 2rem;
    }
    
    .disclaimer strong {
      color: #92400e;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .container {
        box-shadow: none;
        padding: 1rem;
      }
      
      .game-card {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    
    <!-- Header -->
    <div class="header">
      <h1>🍀 Mega-Sena AI</h1>
      <div class="subtitle">Relatório de Geração de Jogos por Orçamento</div>
      <div class="date">Gerado em: ${new Date().toLocaleString('pt-BR')}</div>
    </div>
    
    <!-- Configurações -->
    <div class="section">
      <h2 class="section-title">⚙️ Configurações Aplicadas</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Orçamento</div>
          <div class="stat-value">R$ ${budget.toFixed(2)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Números por Jogo</div>
          <div class="stat-value">${numbersPerGame}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Preço por Jogo</div>
          <div class="stat-value">R$ ${ticketPrice.toFixed(2)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Período Analisado</div>
          <div class="stat-value">${stats.period}</div>
        </div>
      </div>
    </div>
    
    <!-- Estatísticas Gerais -->
    <div class="section">
      <h2 class="section-title">📊 Estatísticas Gerais</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total de Jogos</div>
          <div class="stat-value">${stats.totalGames}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Investimento Total</div>
          <div class="stat-value">R$ ${(stats.totalGames * ticketPrice).toFixed(2)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Números Únicos</div>
          <div class="stat-value">${stats.uniqueNumbers}</div>
          <div class="stat-extra">de 60 possíveis</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Média por Número</div>
          <div class="stat-value">${stats.avgPerNumber}</div>
          <div class="stat-extra">aparições</div>
        </div>
      </div>
    </div>
    
    <!-- Distribuição de Técnicas -->
    <div class="section">
      <h2 class="section-title">🎯 Distribuição de Técnicas</h2>
      <table class="distribution-table">
        <thead>
          <tr>
            <th>Técnica</th>
            <th>Jogos Gerados</th>
            <th>Percentual</th>
            <th>Visualização</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(stats.distribution)
            .filter(([_, count]) => count > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([tech, count]) => {
              const percentage = ((count / stats.totalGames) * 100).toFixed(1);
              const techNames = {
                hybrid: 'Híbrida (Multi-Algoritmo)',
                neural: 'Rede Neural Ponderada',
                frequency: 'Análise de Frequência',
                recent: 'Padrões Recentes',
                evenodd: 'Balanceamento Par/Ímpar',
                decades: 'Distribuição por Dezenas',
                cycles: 'Análise de Ciclos',
                graphs: 'Grafos (Co-ocorrência)',
                markov: 'Cadeias de Markov',
                correlation: 'Análise de Correlação',
                quadrants: 'Supressão de Quadrantes'
              };
              return `
                <tr>
                  <td><strong>${techNames[tech]}</strong></td>
                  <td>${count} jogos</td>
                  <td>${percentage}%</td>
                  <td>
                    <div class="progress-bar">
                      <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
        </tbody>
      </table>
    </div>
    
    <!-- Par/Ímpar -->
    <div class="section">
      <h2 class="section-title">⚖️ Balanceamento Par/Ímpar</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Números Pares</div>
          <div class="stat-value">${stats.evenOdd.even}</div>
          <div class="stat-extra">${stats.evenOdd.evenPercentage}% do total</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Números Ímpares</div>
          <div class="stat-value">${stats.evenOdd.odd}</div>
          <div class="stat-extra">${stats.evenOdd.oddPercentage}% do total</div>
        </div>
      </div>
    </div>
    
    <!-- Distribuição por Dezena -->
    <div class="section">
      <h2 class="section-title">📊 Distribuição por Dezena</h2>
      <div class="stats-grid">
        ${Object.entries(stats.decadeDistribution).map(([range, count]) => `
          <div class="stat-card">
            <div class="stat-label">${range}</div>
            <div class="stat-value">${count}</div>
            <div class="stat-extra">${((count / (stats.totalGames * numbersPerGame)) * 100).toFixed(1)}%</div>
          </div>
        `).join('')}
      </div>
    </div>
    
    <!-- Todos os Jogos -->
    <div class="section">
      <h2 class="section-title">🎲 Todos os Jogos Gerados (${generatedGames.length})</h2>
      <div class="games-grid">
        ${generatedGames.map((game, idx) => `
          <div class="game-card">
            <div class="game-header">
              <span class="game-number">Jogo ${idx + 1}</span>
              <span class="game-technique">${game.techniqueName}</span>
            </div>
            <div class="numbers-display">
              ${game.numbers.map(num => `
                <div class="number-ball">${String(num).padStart(2, '0')}</div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    
    <!-- Disclaimer -->
    <div class="disclaimer">
      <strong>⚠️ Aviso Legal:</strong> Este relatório foi gerado por algoritmos de análise estatística e inteligência artificial. 
      Não há garantia de acertos. A Mega-Sena é um jogo de sorteio aleatório. Jogue com responsabilidade.
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p>Relatório gerado pelo <strong>Mega-Sena AI</strong></p>
      <p>Sistema Inteligente de Análise e Predição</p>
    </div>
    
  </div>
</body>
</html>
    `;

    return html;
  }

  downloadHTMLReport(data, filename = 'relatorio_megasena') {
    const html = this.generateHTMLReport(data);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().getTime()}.html`;
    link.click();
  }

  generateDetailedCSV(data) {
    const { 
      generatedGames, 
      stats, 
      budget, 
      numbersPerGame, 
      ticketPrice 
    } = data;

    let csv = '# RELATÓRIO DETALHADO - MEGA-SENA AI\n';
    csv += `# Gerado em: ${new Date().toLocaleString('pt-BR')}\n\n`;
    
    csv += '## CONFIGURAÇÕES\n';
    csv += `Orçamento,R$ ${budget.toFixed(2)}\n`;
    csv += `Números por Jogo,${numbersPerGame}\n`;
    csv += `Preço por Jogo,R$ ${ticketPrice.toFixed(2)}\n`;
    csv += `Período Analisado,${stats.period}\n\n`;
    
    csv += '## ESTATÍSTICAS GERAIS\n';
    csv += `Total de Jogos,${stats.totalGames}\n`;
    csv += `Investimento Total,R$ ${(stats.totalGames * ticketPrice).toFixed(2)}\n`;
    csv += `Números Únicos Cobertos,${stats.uniqueNumbers}\n`;
    csv += `Média por Número,${stats.avgPerNumber}\n\n`;
    
    csv += '## DISTRIBUIÇÃO DE TÉCNICAS\n';
    csv += 'Técnica,Jogos,Percentual\n';
    Object.entries(stats.distribution)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .forEach(([tech, count]) => {
        const techNames = {
          hybrid: 'Híbrida',
          neural: 'Rede Neural',
          frequency: 'Frequência',
          recent: 'Recentes',
          evenodd: 'Par/Ímpar',
          decades: 'Dezenas',
          cycles: 'Ciclos',
          graphs: 'Grafos',
          markov: 'Markov',
          correlation: 'Correlação',
          quadrants: 'Quadrantes'
        };
        const percentage = ((count / stats.totalGames) * 100).toFixed(1);
        csv += `${techNames[tech]},${count},${percentage}%\n`;
      });
    
    csv += '\n## BALANCEAMENTO PAR/ÍMPAR\n';
    csv += `Pares,${stats.evenOdd.even},${stats.evenOdd.evenPercentage}%\n`;
    csv += `Ímpares,${stats.evenOdd.odd},${stats.evenOdd.oddPercentage}%\n\n`;
    
    csv += '## DISTRIBUIÇÃO POR DEZENA\n';
    csv += 'Faixa,Quantidade,Percentual\n';
    Object.entries(stats.decadeDistribution).forEach(([range, count]) => {
      const percentage = ((count / (stats.totalGames * numbersPerGame)) * 100).toFixed(1);
      csv += `${range},${count},${percentage}%\n`;
    });
    
    csv += '\n## TODOS OS JOGOS\n';
    csv += 'Jogo,';
    for (let i = 1; i <= numbersPerGame; i++) {
      csv += `Numero ${i},`;
    }
    csv += 'Tecnica\n';
    
    generatedGames.forEach((game, idx) => {
      csv += `${idx + 1},${game.numbers.join(',')},${game.techniqueName}\n`;
    });

    return csv;
  }

  downloadDetailedCSV(data, filename = 'relatorio_megasena') {
    const csv = this.generateDetailedCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_detalhado_${new Date().getTime()}.csv`;
    link.click();
  }

  printReport(data) {
    const html = this.generateHTMLReport(data);
    const printWindow = window.open('', '', 'width=1200,height=800');
    printWindow.document.write(html);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }

  generateSummaryReport(data) {
    const { stats, budget, numbersPerGame, ticketPrice } = data;
    
    const summary = {
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleString('pt-BR'),
      configuration: {
        budget: budget,
        numbersPerGame: numbersPerGame,
        ticketPrice: ticketPrice,
        period: stats.period
      },
      statistics: {
        totalGames: stats.totalGames,
        totalInvestment: stats.totalGames * ticketPrice,
        uniqueNumbers: stats.uniqueNumbers,
        avgPerNumber: parseFloat(stats.avgPerNumber),
        evenOdd: stats.evenOdd,
        decadeDistribution: stats.decadeDistribution
      },
      distribution: stats.distribution
    };

    return JSON.stringify(summary, null, 2);
  }

  downloadJSON(data, filename = 'relatorio_megasena') {
    const json = this.generateSummaryReport(data);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().getTime()}.json`;
    link.click();
  }
}

export default new ReportService();
