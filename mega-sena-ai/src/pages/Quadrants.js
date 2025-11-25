import React, { useState, useEffect } from 'react';
import dataService from '../services/dataService';
import aiService from '../services/aiService';
import quadrantService from '../services/quadrantService';
import closingService from '../services/closingService';

function Quadrants() {
  const [hasData, setHasData] = useState(false);
  const [suppressedQuadrants, setSuppressedQuadrants] = useState([]);
  const [availableNumbers, setAvailableNumbers] = useState([]);
  const [quadrantStats, setQuadrantStats] = useState(null);
  const [hotCold, setHotCold] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [closingResult, setClosingResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [technique, setTechnique] = useState('hybrid');
  const [numbersCount, setNumbersCount] = useState(10);
  const [analysisRange, setAnalysisRange] = useState('all');
  const [ticketPrice] = useState(5.00);

  useEffect(() => {
    const loaded = dataService.hasData();
    setHasData(loaded);
    
    if (loaded) {
      updateAnalysis('all');
    }
  }, []);

  useEffect(() => {
    if (hasData) {
      updateAnalysis(analysisRange);
    }
  }, [analysisRange, hasData]);

  useEffect(() => {
    const available = quadrantService.getAvailableNumbers(suppressedQuadrants);
    setAvailableNumbers(available);
  }, [suppressedQuadrants]);

  const updateAnalysis = (range) => {
    let contests = dataService.contests;
    
    if (range !== 'all') {
      const rangeNum = parseInt(range);
      contests = dataService.contests.slice(-rangeNum);
    }

    const stats = quadrantService.analyzeQuadrants(contests);
    const hc = quadrantService.getHotColdQuadrants(contests);
    const sugg = quadrantService.suggestSuppression(contests);

    setQuadrantStats(stats);
    setHotCold(hc);
    setSuggestions(sugg);
  };

  const toggleQuadrant = (quadrant) => {
    if (suppressedQuadrants.includes(quadrant)) {
      setSuppressedQuadrants(suppressedQuadrants.filter(q => q !== quadrant));
    } else {
      if (suppressedQuadrants.length < 2) {
        setSuppressedQuadrants([...suppressedQuadrants, quadrant]);
      } else {
        alert('Máximo de 2 quadrantes podem ser suprimidos (mínimo 30 números)');
      }
    }
  };

  const clearSuppression = () => {
    setSuppressedQuadrants([]);
    setPrediction(null);
    setClosingResult(null);
  };

  const generateWithQuadrants = () => {
    const validation = quadrantService.validateSuppression(suppressedQuadrants, 10);
    
    if (!validation.valid) {
      alert(validation.message);
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

        const result = aiService.generatePredictionWithConstraints(
          contests,
          numbersCount,
          technique,
          [],
          availableNumbers
        );

        setPrediction({
          ...result,
          suppressedQuadrants: [...suppressedQuadrants],
          availableCount: availableNumbers.length,
          analyzedDraws: contests.length
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

  const quadrants = quadrantService.getQuadrants();
  
  const analysisRanges = [
    { value: '50', label: 'Últimos 50 sorteios' },
    { value: '100', label: 'Últimos 100 sorteios' },
    { value: '200', label: 'Últimos 200 sorteios' },
    { value: '500', label: 'Últimos 500 sorteios' },
    { value: '1000', label: 'Últimos 1000 sorteios' },
    { value: 'all', label: `Todos (${dataService.contests.length || 0})` }
  ];

  const techniques = [
    { value: 'hybrid', label: 'Híbrida (Multi-Algoritmo)', desc: 'Combina frequência, padrões recentes e balanceamento' },
    { value: 'neural', label: 'Rede Neural Ponderada', desc: 'Aplica pesos para dados históricos e tendências recentes' },
    { value: 'frequency', label: 'Análise de Frequência', desc: 'Prioriza números mais sorteados historicamente' },
    { value: 'recent', label: 'Padrões Recentes', desc: 'Baseado nos últimos 50 sorteios realizados' },
    { value: 'evenodd', label: 'Balanceamento Par/Ímpar', desc: 'Distribui números pares e ímpares proporcionalmente' },
    { value: 'decades', label: 'Distribuição por Dezenas', desc: 'Equilibra números entre as 6 faixas de dezenas' }
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

  return (
    <div className="page-content">
      
      {/* Header */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)', color: 'white', border: 'none' }}>
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '700' }}>
            🔲 Supressão de Quadrantes
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.95 }}>
            Exclua quadrantes e gere apostas com os números restantes
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
                background: analysisRange === range.value ? 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)' : 'var(--background)',
                color: analysisRange === range.value ? 'white' : 'var(--text-primary)',
                borderRadius: 'var(--radius-md)',
                border: analysisRange === range.value ? '2px solid #f97316' : '2px solid var(--border-color)',
                cursor: 'pointer',
                textAlign: 'center',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (analysisRange !== range.value) {
                  e.currentTarget.style.background = '#fed7aa';
                  e.currentTarget.style.borderColor = '#f97316';
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

      {/* Análise de Quadrantes */}
      {quadrantStats && hotCold && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📊 Análise Histórica dos Quadrantes</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {Object.entries(quadrantStats).map(([key, data]) => {
              const hcData = hotCold[key];
              const statusColor = hcData.status === 'hot' ? '#ef4444' : hcData.status === 'cold' ? '#3b82f6' : '#64748b';
              const statusLabel = hcData.status === 'hot' ? '🔥 Quente' : hcData.status === 'cold' ? '❄️ Frio' : '⚖️ Normal';

              return (
                <div key={key} style={{
                  padding: '1rem',
                  background: 'var(--background)',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${statusColor}`
                }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    {quadrants[key].label}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: statusColor, marginBottom: '0.5rem' }}>
                    {data.percentage}%
                  </div>
                  <div style={{ fontSize: '0.8rem', color: statusColor, fontWeight: '600' }}>
                    {statusLabel}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {hcData.difference > 0 ? '+' : ''}{hcData.difference}% vs média
                  </div>
                </div>
              );
            })}
          </div>

          {suggestions.length > 0 && (
            <div className="alert alert-info" style={{ background: '#dbeafe', borderColor: '#3b82f6' }}>
              <span>💡</span>
              <div>
                <strong>Sugestão IA:</strong> Considere suprimir o {suggestions[0].quadrant} 
                ({suggestions[0].reason}) para otimizar suas apostas.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Seletor de Quadrantes */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">🎯 Selecione Quadrantes para Suprimir</h3>
            <p className="card-subtitle">
              Clique nos quadrantes que deseja EXCLUIR da geração (máx: 2)
            </p>
          </div>
          {suppressedQuadrants.length > 0 && (
            <button onClick={clearSuppression} className="btn" style={{ background: '#dc2626', color: 'white' }}>
              🗑️ Limpar Supressão
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          {Object.entries(quadrants).map(([key, quadrant]) => {
            const isSuppressed = suppressedQuadrants.includes(key);
            
            return (
              <div
                key={key}
                onClick={() => toggleQuadrant(key)}
                style={{
                  padding: '1.5rem',
                  background: isSuppressed ? '#fecaca' : '#dcfce7',
                  border: isSuppressed ? '3px solid #dc2626' : '3px solid #22c55e',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                {isSuppressed && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: '#dc2626',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8rem',
                    fontWeight: '700'
                  }}>
                    ✕ SUPRIMIDO
                  </div>
                )}

                <div style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem', color: isSuppressed ? '#7f1d1d' : '#166534' }}>
                  {quadrant.label}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                  {quadrant.numbers.map(num => (
                    <div key={num} style={{
                      padding: '0.5rem',
                      background: isSuppressed ? '#991b1b' : '#16a34a',
                      color: 'white',
                      borderRadius: 'var(--radius-sm)',
                      textAlign: 'center',
                      fontWeight: '700',
                      fontSize: '0.9rem',
                      opacity: isSuppressed ? 0.5 : 1
                    }}>
                      {String(num).padStart(2, '0')}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '1.5rem', padding: '1rem', background: availableNumbers.length < 10 ? '#fef3c7' : '#dcfce7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            {suppressedQuadrants.length > 0 ? `🎯 Números Disponíveis: ${availableNumbers.length}` : '📊 Todos os 60 números disponíveis'}
          </div>
          {suppressedQuadrants.length > 0 && (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Quadrantes suprimidos: {suppressedQuadrants.join(', ')}
            </div>
          )}
        </div>
      </div>

      {/* Gerador */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🤖 Gerar Números com Restrição</h3>
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
                {Array.from({ length: Math.min(15, availableNumbers.length - 5) }, (_, i) => i + 6).map(num => (
                  <option key={num} value={num}>{num} números</option>
                ))}
              </select>
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Combinações: <strong>{aiService.calculateCombinations(numbersCount, 6).toLocaleString('pt-BR')}</strong>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: '600' }}>
                🧠 Técnica de IA:
              </label>
              <select value={technique} onChange={(e) => setTechnique(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem', border: '2px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white', cursor: 'pointer' }}>
                {techniques.map(tech => (
                  <option key={tech.value} value={tech.value}>{tech.label}</option>
                ))}
              </select>
              <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--background)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                <strong>ℹ️</strong> {techniques.find(t => t.value === technique)?.desc}
              </div>
            </div>

            <div style={{ padding: '1rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#166534', marginBottom: '0.25rem' }}>💰 Custo:</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#15803d' }}>
                R$ {aiService.calculateCost(numbersCount, ticketPrice).toFixed(2)}
              </div>
            </div>

            <button
              onClick={generateWithQuadrants}
              disabled={loading || availableNumbers.length < 10}
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
            >
              {loading ? '⏳ Gerando...' : '🎲 Gerar com Restrição'}
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
                      Usando {prediction.availableCount} números disponíveis • {prediction.analyzedDraws} sorteios analisados
                      {prediction.suppressedQuadrants.length > 0 && ` • Suprimidos: ${prediction.suppressedQuadrants.join(', ')}`}
                    </div>
                  </div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', padding: '2rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', border: '2px solid #f59e0b' }}>
                  <h4 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '700', color: '#92400e' }}>
                    🎯 Números Sugeridos
                  </h4>
                  <div className="numbers-grid">
                    {prediction.numbers.map((num, idx) => (
                      <div key={idx} className="number-ball" style={{ 
                        background: '#f59e0b', 
                        border: '3px solid #92400e',
                        boxShadow: '0 4px 8px rgba(245, 158, 11, 0.3)'
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

                {/* Resultado do Desdobramento */}
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
                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🎯</div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                  Pronto para Gerar
                </h4>
                <p style={{ fontSize: '0.95rem' }}>Suprima quadrantes e gere números restritos</p>
              </div>
            )}
          </div>

        </div>
      </div>

      <div className="alert alert-warning">
        <span style={{ fontSize: '1.3rem' }}>⚠️</span>
        <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
          <strong>Aviso Legal:</strong> Supressão de quadrantes é uma estratégia de redução. Não garante prêmios.
        </div>
      </div>

    </div>
  );
}

export default Quadrants;
