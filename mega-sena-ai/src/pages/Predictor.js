import React, { useState, useEffect } from 'react';
import dataService from '../services/dataService';
import aiService from '../services/aiService';
import analyticsService from '../services/analyticsService';
import closingService from '../services/closingService';

function Predictor() {
  const [numbersCount, setNumbersCount] = useState(6);
  const [technique, setTechnique] = useState('hybrid');
  const [analysisRange, setAnalysisRange] = useState('all');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ticketPrice, setTicketPrice] = useState(5.00);
  const [hasData, setHasData] = useState(false);
  const [delayedNumbers, setDelayedNumbers] = useState([]);
  const [selectedFixed, setSelectedFixed] = useState([]);
  const [closingResult, setClosingResult] = useState(null);

  useEffect(() => {
    setHasData(dataService.hasData());
    
    const savedPrice = localStorage.getItem('megasena_ticket_price');
    if (savedPrice) {
      setTicketPrice(parseFloat(savedPrice));
    }
  }, []);

  useEffect(() => {
    if (!hasData) return;

    let contestsToAnalyze = dataService.contests;
    
    if (analysisRange !== 'all') {
      const rangeNum = parseInt(analysisRange);
      contestsToAnalyze = dataService.contests.slice(-rangeNum);
    }

    const delayed = analyticsService.getDelayedNumbers(contestsToAnalyze, 20);
    setDelayedNumbers(delayed);
    setSelectedFixed([]);
  }, [analysisRange, hasData]);

  const toggleFixedNumber = (num) => {
    if (selectedFixed.includes(num)) {
      setSelectedFixed(selectedFixed.filter(n => n !== num));
    } else {
      if (selectedFixed.length < numbersCount - 1) {
        setSelectedFixed([...selectedFixed, num]);
      } else {
        alert(`Você só pode fixar até ${numbersCount - 1} números!`);
      }
    }
  };

  const clearFixed = () => {
    setSelectedFixed([]);
  };

  const generatePrediction = () => {
    if (!hasData) {
      alert('Nenhum dado carregado! Vá em Configurações e importe os dados.');
      return;
    }

    setLoading(true);
    setClosingResult(null);
    
    setTimeout(() => {
      try {
        let contestsToAnalyze = dataService.contests;
        
        if (analysisRange !== 'all') {
          const range = parseInt(analysisRange);
          contestsToAnalyze = dataService.contests.slice(-range);
        }

        const result = aiService.generatePrediction(
          contestsToAnalyze, 
          numbersCount, 
          technique,
          selectedFixed
        );
        const cost = aiService.calculateCost(numbersCount, ticketPrice);
        
        setPrediction({
          ...result,
          cost: cost.toFixed(2),
          combinations: aiService.calculateCombinations(numbersCount, 6),
          analyzedDraws: contestsToAnalyze.length
        });
      } catch (error) {
        alert('Erro ao gerar predição: ' + error.message);
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
    { value: 'hybrid', label: 'Híbrida (Multi-Algoritmo)', desc: 'Combina frequência, padrões recentes e balanceamento' },
    { value: 'neural', label: 'Rede Neural Ponderada', desc: 'Aplica pesos para dados históricos e tendências recentes' },
    { value: 'frequency', label: 'Análise de Frequência', desc: 'Prioriza números mais sorteados historicamente' },
    { value: 'recent', label: 'Padrões Recentes', desc: 'Baseado nos últimos 50 sorteios realizados' },
    { value: 'evenodd', label: 'Balanceamento Par/Ímpar', desc: 'Distribui números pares e ímpares proporcionalmente' },
    { value: 'decades', label: 'Distribuição por Dezenas', desc: 'Equilibra números entre as 6 faixas de dezenas' }
  ];

  const analysisRanges = [
    { value: '50', label: 'Últimos 50 sorteios' },
    { value: '100', label: 'Últimos 100 sorteios' },
    { value: '200', label: 'Últimos 200 sorteios' },
    { value: '500', label: 'Últimos 500 sorteios' },
    { value: '1000', label: 'Últimos 1000 sorteios' },
    { value: 'all', label: `Todos (${dataService.contests.length || 0})` }
  ];

  const getCurrentRange = () => {
    if (analysisRange === 'all') {
      return dataService.contests.length;
    }
    const range = parseInt(analysisRange);
    return Math.min(range, dataService.contests.length);
  };

  return (
    <div className="page-content">
      
      {!hasData && (
        <div className="alert alert-warning">
          <span>⚠️</span>
          <div>
            <strong>Atenção:</strong> Nenhum dado carregado. 
            <a href="/settings" style={{ marginLeft: '0.5rem', color: 'inherit', textDecoration: 'underline' }}>
              Clique aqui para importar dados
            </a>
          </div>
        </div>
      )}

      {/* Seletor de Período */}
      {hasData && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">📊 Período de Análise</h3>
              <p className="card-subtitle">
                Selecione quantos sorteios serão analisados
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {analysisRanges.map(range => (
              <div
                key={range.value}
                onClick={() => setAnalysisRange(range.value)}
                style={{
                  padding: '1.25rem',
                  background: analysisRange === range.value ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'var(--background)',
                  color: analysisRange === range.value ? 'white' : 'var(--text-primary)',
                  borderRadius: 'var(--radius-md)',
                  border: analysisRange === range.value ? '2px solid #667eea' : '2px solid var(--border-color)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  fontWeight: '600'
                }}
                onMouseEnter={(e) => {
                  if (analysisRange !== range.value) {
                    e.currentTarget.style.background = '#e0e7ff';
                    e.currentTarget.style.borderColor = '#667eea';
                  }
                }}
                onMouseLeave={(e) => {
                  if (analysisRange !== range.value) {
                    e.currentTarget.style.background = 'var(--background)';
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                  }
                }}
              >
                {analysisRange === range.value && <span style={{ marginRight: '0.5rem' }}>✓</span>}
                {range.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Números Atrasados */}
      {hasData && delayedNumbers.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">⏰ Números Estatisticamente Atrasados</h3>
              <p className="card-subtitle">
                {getCurrentRange()} sorteios • Clique para fixar (máx: {numbersCount - 1})
              </p>
            </div>
            {selectedFixed.length > 0 && (
              <button onClick={clearFixed} className="btn" style={{ background: '#dc2626', color: 'white', padding: '0.5rem 1rem' }}>
                🗑️ Limpar ({selectedFixed.length})
              </button>
            )}
          </div>

          {selectedFixed.length > 0 && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f0fdf4', borderRadius: 'var(--radius-md)', border: '2px solid #86efac' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.75rem', color: '#166534' }}>
                ✅ Números Fixados ({selectedFixed.length}/{numbersCount - 1}):
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {selectedFixed.sort((a, b) => a - b).map(num => (
                  <div key={num} onClick={() => toggleFixedNumber(num)} style={{
                    width: '48px', height: '48px', borderRadius: '50%', background: '#22B24C', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700',
                    fontSize: '1.1rem', border: '3px solid #15803d', cursor: 'pointer'
                  }}>
                    {String(num).padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.75rem' }}>
            {delayedNumbers.map((item, idx) => (
              <div key={idx} onClick={() => toggleFixedNumber(item.number)}
                style={{
                  padding: '0.75rem', background: selectedFixed.includes(item.number) ? '#22B24C' : 'var(--background)',
                  borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'center',
                  border: selectedFixed.includes(item.number) ? '2px solid #15803d' : '2px solid var(--border-color)',
                  transition: 'all 0.2s ease', color: selectedFixed.includes(item.number) ? 'white' : 'inherit'
                }}
                title={`Apareceu ${item.frequency}x (esperado: ${item.expectedFrequency}) - ${item.drawsAgo} sem sair`}
              >
                <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                  {String(item.number).padStart(2, '0')}
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>
                  {item.frequency}/{item.expectedFrequency}
                </div>
                <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>
                  {item.drawsAgo} atraso
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gerador */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">🤖 Gerador Inteligente</h3>
            <p className="card-subtitle">Configure e gere sugestões com IA</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem' }}>
          
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1.5rem' }}>⚙️ Configurações</h4>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: '600' }}>
                Quantidade de Números:
              </label>
              <select value={numbersCount} onChange={(e) => {
                const newCount = Number(e.target.value);
                setNumbersCount(newCount);
                if (selectedFixed.length >= newCount) {
                  setSelectedFixed(selectedFixed.slice(0, newCount - 1));
                }
              }} style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', border: '2px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white', cursor: 'pointer' }}>
                {Array.from({ length: 15 }, (_, i) => i + 6).map(num => (
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

            <button onClick={generatePrediction} disabled={loading || !hasData} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              {loading ? '⏳ Analisando...' : '🎲 Gerar Previsão'}
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
                    <strong>Previsão gerada!</strong> 
                    <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                      {prediction.analyzedDraws} sorteios • {prediction.fixedNumbers > 0 && `${prediction.fixedNumbers} fixado(s)`}
                    </div>
                  </div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding: '2rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', border: '2px solid #86efac' }}>
                  <h4 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '700', color: '#166534' }}>
                    🎯 Números Sugeridos
                  </h4>
                  <div className="numbers-grid">
                    {prediction.numbers.map((num, idx) => (
                      <div key={idx} className="number-ball" style={{
                        border: selectedFixed.includes(num) ? '4px solid #15803d' : 'none',
                        boxShadow: selectedFixed.includes(num) ? '0 4px 12px rgba(21, 128, 61, 0.4)' : '0 4px 8px rgba(34, 178, 76, 0.25)'
                      }}>
                        {String(num).padStart(2, '0')}
                      </div>
                    ))}
                  </div>
                </div>

                {/* DESDOBRAMENTO RÁPIDO */}
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
                          {((1 - (closingResult.totalGames / prediction.combinations)) * 100).toFixed(0)}%
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
                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🎲</div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                  Pronto para Gerar
                </h4>
                <p style={{ fontSize: '0.95rem' }}>Configure e clique em "Gerar Previsão"</p>
              </div>
            )}
          </div>

        </div>
      </div>

      <div className="alert alert-warning">
        <span style={{ fontSize: '1.3rem' }}>⚠️</span>
        <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
          <strong>Aviso Legal:</strong> Análise estatística sem garantias. Jogue com responsabilidade.
        </div>
      </div>

    </div>
  );
}

export default Predictor;
