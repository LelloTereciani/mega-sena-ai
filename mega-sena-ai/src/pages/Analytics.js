import React, { useState, useEffect } from 'react';
import dataService from '../services/dataService';
import analyticsService from '../services/analyticsService';

function Analytics() {
  const [hasData, setHasData] = useState(false);
  const [analysisRange, setAnalysisRange] = useState('all');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    setHasData(dataService.hasData());
    if (dataService.hasData()) {
      updateStats('all');
    }
  }, []);

  useEffect(() => {
    if (hasData) {
      updateStats(analysisRange);
    }
  }, [analysisRange, hasData]);

  const updateStats = (range) => {
    let contests = dataService.contests;
    
    if (range !== 'all') {
      const rangeNum = parseInt(range);
      contests = dataService.contests.slice(-rangeNum);
    }

    const hotNumbers = analyticsService.getHotNumbers(contests, 15);
    const coldNumbers = analyticsService.getColdNumbers(contests, 15);
    const topPairs = analyticsService.getTopPairs(contests, 15);
    const leastPairs = analyticsService.getLeastPairs(contests, 15);
    const topTrios = analyticsService.getTopTrios(contests, 15);
    const leastTrios = analyticsService.getLeastTrios(contests, 15);
    const evenOdd = analyticsService.getEvenOddAnalysis(contests);
    const decades = analyticsService.getDecadeAnalysis(contests);
    const sums = analyticsService.getSumAnalysis(contests);
    const delayed = analyticsService.getDelayedNumbers(contests, 10);

    setStats({
      totalContests: contests.length,
      hotNumbers,
      coldNumbers,
      topPairs,
      leastPairs,
      topTrios,
      leastTrios,
      evenOdd,
      decades,
      sums,
      delayed
    });
  };

  const analysisRanges = [
    { value: '50', label: 'Últimos 50' },
    { value: '100', label: 'Últimos 100' },
    { value: '200', label: 'Últimos 200' },
    { value: '500', label: 'Últimos 500' },
    { value: '1000', label: 'Últimos 1000' },
    { value: 'all', label: `Todos (${dataService.contests.length || 0})` }
  ];

  const getCurrentRange = () => {
    if (analysisRange === 'all') return dataService.contests.length;
    return Math.min(parseInt(analysisRange), dataService.contests.length);
  };

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

  if (!stats) {
    return (
      <div className="page-content">
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Carregando análises...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      
      {/* Header */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none' }}>
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '700' }}>
            📊 Análises Estatísticas
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.95 }}>
            Análise completa baseada em {stats.totalContests} sorteios
          </p>
        </div>
      </div>

      {/* Seletor de Período */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🎯 Período de Análise</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          {analysisRanges.map(range => (
            <div
              key={range.value}
              onClick={() => setAnalysisRange(range.value)}
              style={{
                padding: '1rem',
                background: analysisRange === range.value ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'var(--background)',
                color: analysisRange === range.value ? 'white' : 'var(--text-primary)',
                borderRadius: 'var(--radius-md)',
                border: analysisRange === range.value ? '2px solid #667eea' : '2px solid var(--border-color)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                fontWeight: '600'
              }}
            >
              {analysisRange === range.value && '✓ '}
              {range.label}
            </div>
          ))}
        </div>
      </div>

      {/* Números Mais e Menos Sorteados */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Mais Sorteados */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🔥 Números Mais Sorteados</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.hotNumbers.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem',
                background: 'var(--background)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#ef4444',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '1rem',
                  marginRight: '1rem'
                }}>
                  {String(item.number).padStart(2, '0')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                    {item.frequency} vezes
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {item.percentage}% dos sorteios
                  </div>
                </div>
                <div style={{
                  width: '30px',
                  height: '30px',
                  background: '#fef3c7',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  color: '#92400e'
                }}>
                  {idx + 1}º
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Menos Sorteados */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">❄️ Números Menos Sorteados</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.coldNumbers.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem',
                background: 'var(--background)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#3b82f6',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '1rem',
                  marginRight: '1rem'
                }}>
                  {String(item.number).padStart(2, '0')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                    {item.frequency} vezes
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {item.percentage}% dos sorteios
                  </div>
                </div>
                <div style={{
                  width: '30px',
                  height: '30px',
                  background: '#dbeafe',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  color: '#1e40af'
                }}>
                  {idx + 1}º
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Duplas Mais e Menos Sorteadas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Duplas Mais Sorteadas */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🔥🔥 Duplas Mais Sorteadas</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.topPairs.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem',
                background: 'var(--background)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginRight: '1rem' }}>
                  {item.numbers.map(num => (
                    <div key={num} style={{
                      width: '35px',
                      height: '35px',
                      borderRadius: '50%',
                      background: '#f97316',
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
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                    {item.frequency} vezes juntos
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {item.percentage}% dos sorteios
                  </div>
                </div>
                <div style={{
                  padding: '0.25rem 0.5rem',
                  background: '#fed7aa',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: '700',
                  color: '#9a3412',
                  fontSize: '0.85rem'
                }}>
                  #{idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Duplas Menos Sorteadas */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">❄️❄️ Duplas Menos Sorteadas</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.leastPairs.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem',
                background: 'var(--background)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginRight: '1rem' }}>
                  {item.numbers.map(num => (
                    <div key={num} style={{
                      width: '35px',
                      height: '35px',
                      borderRadius: '50%',
                      background: '#6366f1',
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
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                    {item.frequency} vezes juntos
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {item.percentage}% dos sorteios
                  </div>
                </div>
                <div style={{
                  padding: '0.25rem 0.5rem',
                  background: '#e0e7ff',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: '700',
                  color: '#3730a3',
                  fontSize: '0.85rem'
                }}>
                  #{idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Trios Mais e Menos Sorteados */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Trios Mais Sorteados */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🔥🔥🔥 Trios Mais Sorteados</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.topTrios.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem',
                background: 'var(--background)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginRight: '1rem' }}>
                  {item.numbers.map(num => (
                    <div key={num} style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#dc2626',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '0.85rem'
                    }}>
                      {String(num).padStart(2, '0')}
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                    {item.frequency} vezes juntos
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {item.percentage}% dos sorteios
                  </div>
                </div>
                <div style={{
                  padding: '0.25rem 0.5rem',
                  background: '#fecaca',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: '700',
                  color: '#7f1d1d',
                  fontSize: '0.85rem'
                }}>
                  #{idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trios Menos Sorteados */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">❄️❄️❄️ Trios Raros</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.leastTrios.length > 0 ? stats.leastTrios.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem',
                background: 'var(--background)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginRight: '1rem' }}>
                  {item.numbers.map(num => (
                    <div key={num} style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#4f46e5',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '0.85rem'
                    }}>
                      {String(num).padStart(2, '0')}
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                    {item.frequency} vezes juntos
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {item.percentage}% dos sorteios
                  </div>
                </div>
                <div style={{
                  padding: '0.25rem 0.5rem',
                  background: '#c7d2fe',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: '700',
                  color: '#312e81',
                  fontSize: '0.85rem'
                }}>
                  #{idx + 1}
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                Todos os trios aparecem com frequência similar neste período
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Outras Estatísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        
        {/* Par/Ímpar */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">⚖️ Pares vs Ímpares</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '600' }}>Pares</span>
                <span style={{ fontWeight: '700', color: '#3b82f6' }}>{stats.evenOdd.evenPercentage}%</span>
              </div>
              <div style={{ height: '30px', background: 'var(--background)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${stats.evenOdd.evenPercentage}%`, background: '#3b82f6' }}></div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {stats.evenOdd.even} números
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '600' }}>Ímpares</span>
                <span style={{ fontWeight: '700', color: '#ef4444' }}>{stats.evenOdd.oddPercentage}%</span>
              </div>
              <div style={{ height: '30px', background: 'var(--background)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${stats.evenOdd.oddPercentage}%`, background: '#ef4444' }}></div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {stats.evenOdd.odd} números
              </div>
            </div>
          </div>
        </div>

        {/* Soma */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">➕ Soma dos Números</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Média</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                {stats.sums.average}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Mínima</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats.sums.min}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Máxima</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats.sums.max}</div>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Mediana</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>{stats.sums.median}</div>
            </div>
          </div>
        </div>

        {/* Dezenas */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📊 Por Dezena</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.decades.map(item => (
              <div key={item.range}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{item.range}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                    {item.percentage}%
                  </span>
                </div>
                <div style={{ height: '10px', background: 'var(--background)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${item.percentage}%`, background: 'var(--primary-color)' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

export default Analytics;
