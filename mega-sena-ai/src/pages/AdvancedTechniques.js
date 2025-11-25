import React, { useState, useEffect } from 'react';
import dataService from '../services/dataService';
import cycleAnalysisService from '../services/cycleAnalysisService';
import graphAnalysisService from '../services/graphAnalysisService';
import markovService from '../services/markovService';
import correlationService from '../services/correlationService';
import closingService from '../services/closingService';
import aiService from '../services/aiService';

function AdvancedTechniques() {
  const [hasData, setHasData] = useState(false);
  const [numbersCount, setNumbersCount] = useState(10);
  const [technique, setTechnique] = useState('cycle');
  const [analysisRange, setAnalysisRange] = useState('all');
  const [prediction, setPrediction] = useState(null);
  const [closingResult, setClosingResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [ticketPrice] = useState(5.00);

  useEffect(() => {
    const loaded = dataService.hasData();
    setHasData(loaded);
    
    if (loaded) {
      updateAnalysis('all', 'cycle');
    }
  }, []);

  useEffect(() => {
    if (hasData) {
      updateAnalysis(analysisRange, technique);
    }
  }, [analysisRange, technique, hasData]);

  const updateAnalysis = (range, tech) => {
    let contests = dataService.contests;
    
    if (range !== 'all') {
      const rangeNum = parseInt(range);
      contests = dataService.contests.slice(-rangeNum);
    }

    let data = null;

    switch(tech) {
      case 'cycle':
        const cycles = cycleAnalysisService.analyzeCycles(contests);
        data = {
          type: 'cycle',
          cycles,
          mostProbable: cycleAnalysisService.getMostProbable(cycles, 15)
        };
        break;
      
      case 'graph':
        const graph = graphAnalysisService.buildCooccurrenceGraph(contests);
        data = {
          type: 'graph',
          graph,
          mostConnected: graphAnalysisService.getMostConnected(graph, 15)
        };
        break;
      
      case 'markov':
        const matrix = markovService.buildTransitionMatrix(contests);
        const lastDraw = contests[contests.length - 1].numbers;
        data = {
          type: 'markov',
          matrix,
          lastDraw,
          predictions: markovService.predictNext(matrix, lastDraw, 15)
        };
        break;
      
      case 'correlation':
        const correlation = correlationService.buildCorrelationMatrix(contests);
        const scores = correlationService.calculateCorrelationScore(correlation);
        data = {
          type: 'correlation',
          correlation,
          scores,
          topScores: Object.entries(scores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([num, score]) => ({ number: parseInt(num), score: score.toFixed(3) }))
        };
        break;
      
      default:
        break;
    }

    setAnalysisData(data);
  };

  const generatePrediction = () => {
    if (!hasData) {
      alert('Nenhum dado carregado! Vá em Configurações e importe os dados.');
      return;
    }

    setLoading(true);
    setPrediction(null);
    setClosingResult(null);

    setTimeout(() => {
      try {
        let contests = dataService.contests;
        
        if (analysisRange !== 'all') {
          const range = parseInt(analysisRange);
          contests = dataService.contests.slice(-range);
        }

        let numbers = [];

        switch(technique) {
          case 'cycle':
            const cycles = cycleAnalysisService.analyzeCycles(contests);
            numbers = cycleAnalysisService.getMostProbable(cycles, numbersCount).map(p => p.number);
            break;
          
          case 'graph':
            numbers = graphAnalysisService.generatePrediction(
              graphAnalysisService.buildCooccurrenceGraph(contests),
              numbersCount
            );
            break;
          
          case 'markov':
            numbers = markovService.generatePrediction(contests, numbersCount);
            break;
          
          case 'correlation':
            numbers = correlationService.generatePrediction(contests, numbersCount);
            break;
          
          default:
            break;
        }

        setPrediction({
          numbers: numbers.sort((a, b) => a - b),
          technique: techniques.find(t => t.value === technique).label,
          analyzedDraws: contests.length,
          timestamp: new Date().toLocaleString('pt-BR')
        });

      } catch (error) {
        alert('Erro: ' + error.message);
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  const applyClosing = (strategy) => {
    if (!prediction || !prediction.numbers) return;

    let result;
    switch(strategy) {
      case 'full':
        result = closingService.fullCoverage(prediction.numbers);
        break;
      case 'balanced':
        result = closingService.balancedCoverage(prediction.numbers);
        break;
      case 'minimum':
        result = closingService.minimumClosure(prediction.numbers);
        break;
      case 'mathematical':
        result = closingService.mathematicalClosure(prediction.numbers);
        break;
      default:
        return;
    }

    const stats = closingService.calculateStats(result);
    setClosingResult({ ...result, stats });
  };

  const downloadCSV = () => {
    if (!closingResult) return;
    closingService.downloadCSV(closingResult, ticketPrice);
  };

  const techniques = [
    { 
      value: 'cycle', 
      label: '🔄 Análise de Ciclos', 
      desc: 'Detecta periodicidade de aparição dos números e prevê próximas ocorrências',
      color: '#3b82f6'
    },
    { 
      value: 'graph', 
      label: '🕸️ Grafos (Co-ocorrência)', 
      desc: 'Identifica números que aparecem frequentemente juntos usando teoria de grafos',
      color: '#8b5cf6'
    },
    { 
      value: 'markov', 
      label: '⛓️ Cadeias de Markov', 
      desc: 'Probabilidades de transição baseadas no último sorteio',
      color: '#ec4899'
    },
    { 
      value: 'correlation', 
      label: '📈 Análise de Correlação', 
      desc: 'Mede dependência estatística entre pares de números',
      color: '#f59e0b'
    }
  ];

  const analysisRanges = [
    { value: '50', label: 'Últimos 50 sorteios' },
    { value: '100', label: 'Últimos 100 sorteios' },
    { value: '200', label: 'Últimos 200 sorteios' },
    { value: '500', label: 'Últimos 500 sorteios' },
    { value: '1000', label: 'Últimos 1000 sorteios' },
    { value: 'all', label: `Todos (${dataService.contests.length || 0})` }
  ];

  if (!hasData) {
    return (
      <div className="page-content">
        <div className="alert alert-warning">
          <span>⚠️</span>
          <div>
            <strong>Nenhum dado carregado.</strong>
            <a href="/settings" style={{ marginLeft: '0.5rem', color: 'inherit', textDecoration: 'underline' }}>
              Clique aqui para importar dados
            </a>
          </div>
        </div>
      </div>
    );
  }

  const currentTechnique = techniques.find(t => t.value === technique);

  return (
    <div className="page-content">
      
      {/* Header */}
      <div className="card" style={{ background: `linear-gradient(135deg, ${currentTechnique.color} 0%, #1e293b 100%)`, color: 'white', border: 'none' }}>
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '700' }}>
            🧠 Técnicas Avançadas de Ciência de Dados
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.95 }}>
            Algoritmos estatísticos sem necessidade de treinamento
          </p>
        </div>
      </div>

      {/* Seletor de Período */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📊 Período de Análise</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {analysisRanges.map(range => (
            <div
              key={range.value}
              onClick={() => setAnalysisRange(range.value)}
              style={{
                padding: '1.25rem',
                background: analysisRange === range.value ? `linear-gradient(135deg, ${currentTechnique.color} 0%, #1e293b 100%)` : 'var(--background)',
                color: analysisRange === range.value ? 'white' : 'var(--text-primary)',
                borderRadius: 'var(--radius-md)',
                border: analysisRange === range.value ? `2px solid ${currentTechnique.color}` : '2px solid var(--border-color)',
                cursor: 'pointer',
                textAlign: 'center',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (analysisRange !== range.value) {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.borderColor = currentTechnique.color;
                }
              }}
              onMouseLeave={(e) => {
                if (analysisRange !== range.value) {
                  e.currentTarget.style.background = 'var(--background)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }
              }}
            >
              {analysisRange === range.value && '✓ '}
              {range.label}
            </div>
          ))}
        </div>
      </div>

      {/* Seletor de Técnica */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🔬 Selecione a Técnica</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          {techniques.map(tech => (
            <div
              key={tech.value}
              onClick={() => setTechnique(tech.value)}
              style={{
                padding: '1.5rem',
                background: technique === tech.value ? `linear-gradient(135deg, ${tech.color}20 0%, ${tech.color}10 100%)` : 'var(--background)',
                borderRadius: 'var(--radius-lg)',
                border: technique === tech.value ? `3px solid ${tech.color}` : '2px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              {technique === tech.value && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: tech.color,
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem',
                  fontWeight: '700'
                }}>
                  ✓ SELECIONADO
                </div>
              )}

              <div style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.75rem', color: tech.color }}>
                {tech.label}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {tech.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visualização da Análise */}
      {analysisData && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📊 Análise: {currentTechnique.label}</h3>
          </div>

          {analysisData.type === 'cycle' && (
            <div>
              <div style={{ marginBottom: '1rem', padding: '1rem', background: '#eff6ff', borderRadius: 'var(--radius-md)' }}>
                <strong>💡 Como funciona:</strong> Calcula o intervalo médio entre aparições de cada número e identifica quais estão "atrasados" em relação ao seu ciclo natural.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
                {analysisData.mostProbable.map((item, idx) => (
                  <div key={idx} style={{
                    padding: '1rem',
                    background: item.probability > 70 ? '#fee2e2' : item.probability > 50 ? '#fef3c7' : '#f0fdf4',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${item.probability > 70 ? '#ef4444' : item.probability > 50 ? '#f59e0b' : '#22c55e'}`,
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                      {String(item.number).padStart(2, '0')}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                      {item.status}
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>
                      {item.probability}% prob.
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      {item.timeSinceLast} sorteios atrás
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysisData.type === 'graph' && (
            <div>
              <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f5f3ff', borderRadius: 'var(--radius-md)' }}>
                <strong>💡 Como funciona:</strong> Cria uma rede de conexões entre números baseada em quantas vezes aparecem juntos nos sorteios.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                {analysisData.mostConnected.map((item, idx) => (
                  <div key={idx} style={{
                    padding: '1rem',
                    background: 'var(--background)',
                    borderRadius: 'var(--radius-md)',
                    border: '2px solid #8b5cf6'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: '#8b5cf6',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '1.2rem'
                      }}>
                        {String(item.number).padStart(2, '0')}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem', textAlign: 'center' }}>
                      {item.totalConnections} conexões totais
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                      Pares frequentes:
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                      {item.strongPairs.map((pair, pidx) => (
                        <div key={pidx} style={{
                          padding: '0.25rem 0.5rem',
                          background: '#e0e7ff',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          color: '#4f46e5'
                        }}>
                          {String(pair.number).padStart(2, '0')} ({pair.cooccurrences}x)
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysisData.type === 'markov' && (
            <div>
              <div style={{ marginBottom: '1rem', padding: '1rem', background: '#fce7f3', borderRadius: 'var(--radius-md)' }}>
                <strong>💡 Como funciona:</strong> Calcula probabilidades de cada número aparecer no próximo sorteio baseado nos números do último sorteio.
              </div>
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#fef3c7', borderRadius: 'var(--radius-md)' }}>
                <strong>🎯 Último sorteio:</strong> {analysisData.lastDraw.map(n => String(n).padStart(2, '0')).join(' - ')}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem' }}>
                {analysisData.predictions.map((item, idx) => (
                  <div key={idx} style={{
                    padding: '1rem',
                    background: 'var(--background)',
                    borderRadius: 'var(--radius-md)',
                    border: '2px solid #ec4899',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                      {String(item.number).padStart(2, '0')}
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#ec4899' }}>
                      {item.probability}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysisData.type === 'correlation' && (
            <div>
              <div style={{ marginBottom: '1rem', padding: '1rem', background: '#fef3c7', borderRadius: 'var(--radius-md)' }}>
                <strong>💡 Como funciona:</strong> Mede o quanto cada número tende a aparecer com outros números usando análise de correlação estatística.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem' }}>
                {analysisData.topScores.map((item, idx) => (
                  <div key={idx} style={{
                    padding: '1rem',
                    background: 'var(--background)',
                    borderRadius: 'var(--radius-md)',
                    border: '2px solid #f59e0b',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                      {String(item.number).padStart(2, '0')}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Score: {item.score}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gerador */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🎲 Gerar Números</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem' }}>
          
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1.5rem' }}>⚙️ Configurações</h4>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: '600' }}>
                Quantidade de Números:
              </label>
              <select value={numbersCount} onChange={(e) => setNumbersCount(Number(e.target.value))}
                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', border: '2px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white', cursor: 'pointer' }}>
                {Array.from({ length: 15 }, (_, i) => i + 6).map(num => (
                  <option key={num} value={num}>{num} números</option>
                ))}
              </select>
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Combinações: <strong>{aiService.calculateCombinations(numbersCount, 6).toLocaleString('pt-BR')}</strong>
              </div>
            </div>

            <div style={{ padding: '1rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#166534', marginBottom: '0.25rem' }}>💰 Custo:</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#15803d' }}>
                R$ {aiService.calculateCost(numbersCount, ticketPrice).toFixed(2)}
              </div>
            </div>

            <button
              onClick={generatePrediction}
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', background: currentTechnique.color }}
            >
              {loading ? '⏳ Gerando...' : '🎲 Gerar Previsão'}
            </button>
          </div>

          <div>
            {loading && (
              <div className="loading-container">
                <div className="spinner"></div>
                <p className="loading-text">Processando...</p>
              </div>
            )}

            {prediction && !loading && (
              <div>
                <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
                  <span>✅</span>
                  <div>
                    <strong>Números gerados!</strong> 
                    <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                      {prediction.analyzedDraws} sorteios analisados • Técnica: {prediction.technique}
                    </div>
                  </div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', padding: '2rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', border: `2px solid ${currentTechnique.color}` }}>
                  <h4 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '700', color: '#92400e' }}>
                    🎯 Números Sugeridos
                  </h4>
                  <div className="numbers-grid">
                    {prediction.numbers.map((num, idx) => (
                      <div key={idx} className="number-ball" style={{ 
                        background: currentTechnique.color,
                        border: `3px solid ${currentTechnique.color}`,
                        boxShadow: `0 4px 8px ${currentTechnique.color}40`
                      }}>
                        {String(num).padStart(2, '0')}
                      </div>
                    ))}
                  </div>
                </div>

                {numbersCount > 6 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                      <strong>💡 Dica:</strong> Com {numbersCount} números, você pode usar desdobramento para reduzir custo!
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                      <button onClick={() => applyClosing('minimum')} className="btn" style={{ background: '#22B24C', color: 'white' }}>
                        ⚡ Mínimo
                      </button>
                      <button onClick={() => applyClosing('balanced')} className="btn" style={{ background: '#3b82f6', color: 'white' }}>
                        ⚖️ Balanceado
                      </button>
                      <button onClick={() => applyClosing('mathematical')} className="btn" style={{ background: '#8b5cf6', color: 'white' }}>
                        🧮 Matemático
                      </button>
                      <button onClick={() => applyClosing('full')} className="btn" style={{ background: '#ef4444', color: 'white' }}>
                        💯 Completo
                      </button>
                    </div>
                  </div>
                )}

                {closingResult && (
                  <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#f0f9ff', borderRadius: 'var(--radius-md)', border: '2px solid #3b82f6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e40af', marginBottom: '0.25rem' }}>
                          {closingResult.strategy}
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: '#3b82f6' }}>{closingResult.description}</p>
                      </div>
                      <button onClick={downloadCSV} className="btn btn-primary">
                        📥 Baixar CSV
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ padding: '0.75rem', background: 'white', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Jogos</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>{closingResult.totalGames}</div>
                      </div>
                      <div style={{ padding: '0.75rem', background: 'white', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Custo</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#15803d' }}>
                          R$ {(closingResult.totalGames * ticketPrice).toFixed(2)}
                        </div>
                      </div>
                      <div style={{ padding: '0.75rem', background: 'white', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Economia</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#9333ea' }}>
                          {((1 - (closingResult.totalGames / aiService.calculateCombinations(numbersCount, 6))) * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.85rem', padding: '0.75rem', background: 'white', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                      <strong>✅ Garantia:</strong> {closingResult.guarantee}
                    </div>

                    {closingResult.stats && (
                      <div style={{ fontSize: '0.85rem', padding: '0.75rem', background: 'white', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                        <strong>📊 Estatísticas:</strong>
                        <div style={{ marginTop: '0.5rem' }}>
                          • Aparições por número (média): <strong>{closingResult.stats.averageAppearance}</strong><br/>
                          • Mínimo: <strong>{closingResult.stats.minAppearance}</strong> | Máximo: <strong>{closingResult.stats.maxAppearance}</strong>
                        </div>
                      </div>
                    )}

                    <details style={{ marginTop: '1rem' }}>
                      <summary style={{ cursor: 'pointer', fontWeight: '600', color: '#1e40af', marginBottom: '0.75rem' }}>
                        Ver {closingResult.totalGames} jogos gerados
                      </summary>
                      <div style={{ maxHeight: '400px', overflowY: 'auto', background: 'white', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                        {closingResult.games.map((game, idx) => (
                          <div key={idx} style={{ 
                            marginBottom: '0.75rem', 
                            padding: '1rem', 
                            background: idx % 2 === 0 ? '#f8fafc' : 'white', 
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-color)'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                              <strong style={{ color: '#1e40af' }}>Jogo {idx + 1}</strong>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              {game.map((num, numIdx) => (
                                <div key={numIdx} style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  background: '#3b82f6',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: '700',
                                  fontSize: '0.9rem'
                                }}>
                                  {String(num).padStart(2, '0')}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
              </div>
            )}

            {!prediction && !loading && (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🧠</div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                  Pronto para Gerar
                </h4>
                <p style={{ fontSize: '0.95rem' }}>Selecione a técnica e clique em "Gerar Previsão"</p>
              </div>
            )}
          </div>

        </div>
      </div>

      <div className="alert alert-warning">
        <span style={{ fontSize: '1.3rem' }}>⚠️</span>
        <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
          <strong>Aviso Legal:</strong> Técnicas estatísticas sem garantias. Jogue com responsabilidade.
        </div>
      </div>

    </div>
  );
}

export default AdvancedTechniques;
