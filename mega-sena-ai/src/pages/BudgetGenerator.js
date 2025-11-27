import React, { useState, useEffect } from 'react';
import dataService from '../services/dataService';
import aiService from '../services/aiService';
import quadrantService from '../services/quadrantService';
import cycleAnalysisService from '../services/cycleAnalysisService';
import graphAnalysisService from '../services/graphAnalysisService';
import markovService from '../services/markovService';
import correlationService from '../services/correlationService';
import reportService from '../services/reportService';

function BudgetGenerator() {
  const [hasData, setHasData] = useState(false);
  const [budget, setBudget] = useState(100.00);
  const [ticketPrice] = useState(6.00);
  const [numbersPerGame, setNumbersPerGame] = useState(6);
  const [period, setPeriod] = useState('all');
  const [totalGames, setTotalGames] = useState(0);
  
  const [basicTechniques, setBasicTechniques] = useState({
    hybrid: 20,
    neural: 10,
    frequency: 10,
    recent: 10,
    evenodd: 5,
    decades: 5
  });

  const [advancedTechniques, setAdvancedTechniques] = useState({
    cycles: 15,
    graphs: 10,
    markov: 10,
    correlation: 5
  });

  const [useQuadrants, setUseQuadrants] = useState(false);
  const [suppressedQuadrants, setSuppressedQuadrants] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [quadrantDistribution, setQuadrantDistribution] = useState(0);

  const [generatedGames, setGeneratedGames] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [previewDistribution, setPreviewDistribution] = useState(null);

  const periodOptions = [
    { value: '50', label: 'Últimos 50' },
    { value: '100', label: 'Últimos 100' },
    { value: '200', label: 'Últimos 200' },
    { value: '500', label: 'Últimos 500' },
    { value: '1000', label: 'Últimos 1000' },
    { value: 'all', label: 'Todos' }
  ];

  useEffect(() => {
    setHasData(dataService.hasData());
  }, []);

  useEffect(() => {
    const costPerGame = aiService.calculateCost(numbersPerGame, ticketPrice);
    const games = Math.floor(budget / costPerGame);
    setTotalGames(games);
  }, [budget, ticketPrice, numbersPerGame]);

  const techniqueNames = {
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

  useEffect(() => {
    const contests = dataService.contests;
    if (contests && contests.length > 0) {
      try {
        const quadrantAnalysis = quadrantService.analyzeQuadrants(contests);
        setAnalysis(quadrantAnalysis);
      } catch (err) {
        console.error('Erro ao analisar quadrantes:', err);
      }
    }
  }, []); 

  const handleBasicTechniqueChange = (tech, value) => {
    setBasicTechniques(prev => ({
      ...prev,
      [tech]: Math.max(0, Math.min(100, parseInt(value) || 0))
    }));
  };

  const handleAdvancedTechniqueChange = (tech, value) => {
    setAdvancedTechniques(prev => ({
      ...prev,
      [tech]: Math.max(0, Math.min(100, parseInt(value) || 0))
    }));
  };

  const toggleQuadrant = (quadrantId) => {
    if (suppressedQuadrants.includes(quadrantId)) {
      setSuppressedQuadrants(suppressedQuadrants.filter(id => id !== quadrantId));
    } else {
      if (suppressedQuadrants.length >= 2) {
        setError('⚠️ Você pode suprimir no máximo 2 quadrantes!');
        return;
      }
      setSuppressedQuadrants([...suppressedQuadrants, quadrantId]);
    }
  };

  const getFilteredContests = () => {
    const contests = dataService.contests;
    if (period === 'all') return contests;
    
    const periodNum = parseInt(period);
    return contests.slice(-periodNum);
  };

  const normalizeTechniques = () => {
    const allTechniques = {
      ...basicTechniques,
      ...advancedTechniques,
      ...(useQuadrants ? { quadrants: quadrantDistribution } : {})
    };

    const total = Object.values(allTechniques).reduce((sum, val) => sum + val, 0);
    if (total === 0) return allTechniques;
    
    const normalized = {};
    Object.keys(allTechniques).forEach(key => {
      normalized[key] = Math.round((allTechniques[key] / total) * 100);
    });
    return normalized;
  };

  const calculateExactDistribution = () => {
    const normalized = normalizeTechniques();
    const distribution = {};
    const remainders = {};
    
    let allocated = 0;
    Object.entries(normalized).forEach(([tech, percentage]) => {
      const exact = (percentage / 100) * totalGames;
      const floored = Math.floor(exact);
      distribution[tech] = floored;
      remainders[tech] = exact - floored;
      allocated += floored;
    });
    
    const remaining = totalGames - allocated;
    const sortedByRemainder = Object.entries(remainders)
      .sort((a, b) => b[1] - a[1])
      .slice(0, remaining);
    
    sortedByRemainder.forEach(([tech]) => {
      distribution[tech]++;
    });
    
    return distribution;
  };

  useEffect(() => {
    if (totalGames > 0) {
      const preview = calculateExactDistribution();
      setPreviewDistribution(preview);
    } else {
      setPreviewDistribution(null);
    }
  }, [budget, numbersPerGame, basicTechniques, advancedTechniques, useQuadrants, quadrantDistribution, suppressedQuadrants, totalGames]);

  const generateWithBasicTechnique = (contests, technique) => {
    const prediction = aiService.generatePrediction(contests, numbersPerGame, technique, []);
    return prediction.numbers;
  };

  const generateWithCycles = (contests) => {
    try {
      const analysis = cycleAnalysisService.analyzeCycles(contests, numbersPerGame);
      const predicted = analysis.predictedNumbers || [];
      
      if (predicted.length >= numbersPerGame) {
        return predicted.slice(0, numbersPerGame).sort((a, b) => a - b);
      }
      
      const frequency = {};
      contests.forEach(contest => {
        contest.numbers.forEach(num => {
          frequency[num] = (frequency[num] || 0) + 1;
        });
      });
      
      const sorted = Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .map(([num]) => parseInt(num));
      
      const combined = [...new Set([...predicted, ...sorted])];
      return combined.slice(0, numbersPerGame).sort((a, b) => a - b);
    } catch (err) {
      console.error('Erro em cycles:', err);
      return generateWithBasicTechnique(contests, 'frequency');
    }
  };

  const generateWithGraphs = (contests) => {
    try {
      const analysis = graphAnalysisService.analyzeGraph(contests);
      const topNodes = analysis.topNodes || [];
      
      if (topNodes.length >= numbersPerGame) {
        return topNodes.slice(0, numbersPerGame).sort((a, b) => a - b);
      }
      
      return generateWithBasicTechnique(contests, 'frequency');
    } catch (err) {
      console.error('Erro em graphs:', err);
      return generateWithBasicTechnique(contests, 'frequency');
    }
  };

  const generateWithMarkov = (contests) => {
    try {
      if (contests.length < 2) {
        return generateWithBasicTechnique(contests, 'frequency');
      }
      
      const lastContest = contests[contests.length - 1];
      const prediction = markovService.predictNext(contests, lastContest.numbers);
      
      if (prediction.predictions && prediction.predictions.length >= numbersPerGame) {
        return prediction.predictions.slice(0, numbersPerGame).sort((a, b) => a - b);
      }
      
      return generateWithBasicTechnique(contests, 'frequency');
    } catch (err) {
      console.error('Erro em markov:', err);
      return generateWithBasicTechnique(contests, 'frequency');
    }
  };

  const generateWithCorrelation = (contests) => {
    try {
      const analysis = correlationService.analyzeCorrelation(contests);
      const highCorr = analysis.highCorrelation || [];
      
      const numbers = highCorr
        .flatMap(pair => pair.numbers)
        .filter((num, idx, arr) => arr.indexOf(num) === idx)
        .slice(0, numbersPerGame);
      
      if (numbers.length >= numbersPerGame) {
        return numbers.sort((a, b) => a - b);
      }
      
      return generateWithBasicTechnique(contests, 'frequency');
    } catch (err) {
      console.error('Erro em correlation:', err);
      return generateWithBasicTechnique(contests, 'frequency');
    }
  };

  const generateWithQuadrants = (contests) => {
    try {
      return quadrantService.generatePrediction(
        contests,
        numbersPerGame,
        suppressedQuadrants,
        'frequency'
      );
    } catch (err) {
      console.error('Erro em quadrants:', err);
      return generateWithBasicTechnique(contests, 'frequency');
    }
  };

  const generateGames = () => {
    if (!hasData) {
      setError('⚠️ Nenhum dado carregado! Vá em Configurações e importe os dados.');
      return;
    }

    if (totalGames < 1) {
      setError(`⚠️ Orçamento insuficiente! Mínimo R$ ${aiService.calculateCost(numbersPerGame, ticketPrice).toFixed(2)} para 1 jogo.`);
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedGames(null);
    setStats(null);

    setTimeout(() => {
      try {
        const contests = getFilteredContests();
        const games = [];
        const uniqueGamesSet = new Set();
        
        const distribution = calculateExactDistribution();

        const generateRandomGame = () => {
          const allNumbers = Array.from({ length: 60 }, (_, i) => i + 1);
          const shuffled = allNumbers.sort(() => Math.random() - 0.5);
          return shuffled.slice(0, numbersPerGame).sort((a, b) => a - b);
        };

        const addVariation = (numbers, variationLevel = 1) => {
          const newNumbers = [...numbers];
          const allNumbers = Array.from({ length: 60 }, (_, i) => i + 1);
          const available = allNumbers.filter(n => !newNumbers.includes(n));
          
          for (let i = 0; i < variationLevel && available.length > 0; i++) {
            const replaceIdx = Math.floor(Math.random() * newNumbers.length);
            const randomAvailable = available.splice(Math.floor(Math.random() * available.length), 1)[0];
            newNumbers[replaceIdx] = randomAvailable;
          }
          
          return newNumbers.sort((a, b) => a - b);
        };

        Object.entries(distribution).forEach(([tech, count]) => {
          let generatedForTech = 0;

          while (generatedForTech < count) {
            let numbers = [];
            let gameKey = '';
            let foundUnique = false;

            for (let attempt = 0; attempt < 10; attempt++) {
              try {
                if (['hybrid', 'neural', 'frequency', 'recent', 'evenodd', 'decades'].includes(tech)) {
                  numbers = generateWithBasicTechnique(contests, tech);
                }
                else if (tech === 'cycles') {
                  numbers = generateWithCycles(contests);
                }
                else if (tech === 'graphs') {
                  numbers = generateWithGraphs(contests);
                }
                else if (tech === 'markov') {
                  numbers = generateWithMarkov(contests);
                }
                else if (tech === 'correlation') {
                  numbers = generateWithCorrelation(contests);
                }
                else if (tech === 'quadrants') {
                  numbers = generateWithQuadrants(contests);
                }
                else {
                  numbers = generateWithBasicTechnique(contests, 'hybrid');
                }

                if (!Array.isArray(numbers) || numbers.length !== numbersPerGame) {
                  numbers = generateWithBasicTechnique(contests, 'frequency');
                }

                if (attempt > 0) {
                  numbers = addVariation(numbers, attempt);
                }

                gameKey = numbers.sort((a, b) => a - b).join('-');

                if (!uniqueGamesSet.has(gameKey)) {
                  foundUnique = true;
                  break;
                }

              } catch (err) {
                console.error(`Erro ao gerar com técnica ${tech}:`, err);
              }
            }

            if (!foundUnique && games.length > 0) {
              for (let attempt = 0; attempt < 20; attempt++) {
                const baseGame = games[Math.floor(Math.random() * games.length)].numbers;
                numbers = addVariation(baseGame, Math.min(numbersPerGame - 2, 3 + attempt));
                gameKey = numbers.join('-');

                if (!uniqueGamesSet.has(gameKey)) {
                  foundUnique = true;
                  break;
                }
              }
            }

            if (!foundUnique) {
              for (let attempt = 0; attempt < 100; attempt++) {
                numbers = generateRandomGame();
                gameKey = numbers.join('-');

                if (!uniqueGamesSet.has(gameKey)) {
                  foundUnique = true;
                  break;
                }
              }
            }

            if (!foundUnique) {
              console.error(`Impossível gerar mais jogos únicos. Total gerado: ${games.length}`);
              break;
            }

            uniqueGamesSet.add(gameKey);
            games.push({
              numbers: numbers,
              technique: tech,
              techniqueName: techniqueNames[tech]
            });
            generatedForTech++;
          }
        });

        const finalCheck = new Set();
        const duplicates = [];
        games.forEach((game, idx) => {
          const key = game.numbers.join('-');
          if (finalCheck.has(key)) {
            duplicates.push(idx + 1);
          } else {
            finalCheck.add(key);
          }
        });

        if (duplicates.length > 0) {
          console.error(`ERRO CRÍTICO: ${duplicates.length} duplicatas nos jogos: ${duplicates.join(', ')}`);
          setError(`⚠️ ERRO: Foram detectadas ${duplicates.length} duplicatas nos jogos ${duplicates.slice(0, 5).join(', ')}${duplicates.length > 5 ? '...' : ''}. A geração foi cancelada. Tente novamente ou reduza a quantidade de jogos.`);
          setLoading(false);
          return;
        }

        const allNumbers = games.flatMap(g => g.numbers);
        const numberFrequency = {};
        allNumbers.forEach(num => {
          numberFrequency[num] = (numberFrequency[num] || 0) + 1;
        });

        const uniqueNumbers = Object.keys(numberFrequency).length;
        const avgPerNumber = Object.values(numberFrequency).reduce((sum, val) => sum + val, 0) / uniqueNumbers;

        const decadeDistribution = {
          '01-10': 0,
          '11-20': 0,
          '21-30': 0,
          '31-40': 0,
          '41-50': 0,
          '51-60': 0
        };

        allNumbers.forEach(num => {
          if (num <= 10) decadeDistribution['01-10']++;
          else if (num <= 20) decadeDistribution['11-20']++;
          else if (num <= 30) decadeDistribution['21-30']++;
          else if (num <= 40) decadeDistribution['31-40']++;
          else if (num <= 50) decadeDistribution['41-50']++;
          else decadeDistribution['51-60']++;
        });

        const evenCount = allNumbers.filter(n => n % 2 === 0).length;
        const oddCount = allNumbers.length - evenCount;

        setGeneratedGames(games);
        setStats({
          totalGames: games.length,
          uniqueNumbers,
          avgPerNumber: avgPerNumber.toFixed(2),
          numberFrequency,
          decadeDistribution,
          evenOdd: {
            even: evenCount,
            odd: oddCount,
            evenPercentage: ((evenCount / allNumbers.length) * 100).toFixed(1),
            oddPercentage: ((oddCount / allNumbers.length) * 100).toFixed(1)
          },
          distribution,
          period: period === 'all' ? 'Todos' : `Últimos ${period}`,
          numbersPerGame
        });

        console.log(`✅ ${games.length} jogos 100% únicos gerados com sucesso!`);

      } catch (err) {
        setError('❌ Erro ao gerar jogos: ' + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  const totalBasicPercentage = Object.values(basicTechniques).reduce((sum, val) => sum + val, 0);
  const totalAdvancedPercentage = Object.values(advancedTechniques).reduce((sum, val) => sum + val, 0);
  const totalPercentage = totalBasicPercentage + totalAdvancedPercentage + (useQuadrants ? quadrantDistribution : 0);

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
      
      <div className="card" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', color: 'white', border: 'none' }}>
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '700' }}>
            💰 Gerador por Orçamento
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.95 }}>
            Defina seu investimento e gere jogos otimizados automaticamente - Ideal para bolões
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <span>❌</span>
          <div>{error}</div>
        </div>
      )}

      {hasData && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">📊 Período de Análise</h3>
              <p className="card-subtitle">
                Selecione quantos sorteios serão considerados
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {periodOptions.map(option => (
              <div
                key={option.value}
                onClick={() => setPeriod(option.value)}
                style={{
                  padding: '1.25rem',
                  background: period === option.value ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' : 'var(--background)',
                  color: period === option.value ? 'white' : 'var(--text-primary)',
                  borderRadius: 'var(--radius-md)',
                  border: period === option.value ? '2px solid #6d28d9' : '2px solid var(--border-color)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  fontWeight: '600'
                }}
                onMouseEnter={(e) => {
                  if (period !== option.value) {
                    e.currentTarget.style.background = '#ede9fe';
                    e.currentTarget.style.borderColor = '#8b5cf6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (period !== option.value) {
                    e.currentTarget.style.background = 'var(--background)';
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                  }
                }}
              >
                {period === option.value && <span style={{ marginRight: '0.5rem' }}>✓</span>}
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">⚙️ Configurações Básicas</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: '600' }}>
              💵 Valor do Investimento:
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
              step="10"
              min="6"
              style={{
                width: '100%',
                padding: '0.875rem',
                fontSize: '1.3rem',
                fontWeight: '700',
                border: '2px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: '600' }}>
              🎲 Números por Jogo:
            </label>
            <select
              value={numbersPerGame}
              onChange={(e) => setNumbersPerGame(parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '0.875rem',
                fontSize: '1.3rem',
                fontWeight: '700',
                border: '2px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                background: 'white',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              {Array.from({ length: 15 }, (_, i) => i + 6).map(num => (
                <option key={num} value={num}>{num} números</option>
              ))}
            </select>
          </div>

        </div>

        <div style={{ 
          marginTop: '1.5rem',
          padding: '1.5rem', 
          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', 
          borderRadius: 'var(--radius-lg)', 
          border: '2px solid #3b82f6',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#1e40af', marginBottom: '0.25rem', fontWeight: '600' }}>
              Total de Jogos
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e3a8a' }}>
              {totalGames}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#1e40af', marginBottom: '0.25rem', fontWeight: '600' }}>
              Custo por Jogo
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#15803d' }}>
              R$ {aiService.calculateCost(numbersPerGame, ticketPrice).toFixed(2)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#1e40af', marginBottom: '0.25rem', fontWeight: '600' }}>
              Investimento Real
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#dc2626' }}>
              R$ {(totalGames * aiService.calculateCost(numbersPerGame, ticketPrice)).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🎯 Distribuição de Técnicas</h3>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Total: {totalPercentage}% {totalPercentage !== 100 && '(será normalizado)'}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#3b82f6' }}>
              🤖 Técnicas de IA Básicas ({totalBasicPercentage}%)
            </h4>
            {Object.entries(basicTechniques).map(([tech, value]) => (
              <div key={tech} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                    {techniqueNames[tech]}
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleBasicTechniqueChange(tech, e.target.value)}
                    min="0"
                    max="100"
                    style={{
                      width: '70px',
                      padding: '0.4rem',
                      fontSize: '0.9rem',
                      border: '2px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      textAlign: 'center'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ 
                    flex: 1,
                    height: '8px', 
                    background: '#e2e8f0', 
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${value}%`,
                      height: '100%',
                      background: '#3b82f6',
                      transition: 'width 0.3s'
                    }}></div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', minWidth: '60px' }}>
                    {previewDistribution && previewDistribution[tech] !== undefined 
                      ? `${previewDistribution[tech]} jogos` 
                      : `≈ ${Math.round((value / 100) * totalGames)} jogos`}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#ec4899' }}>
              🧠 Técnicas Avançadas ({totalAdvancedPercentage}%)
            </h4>
            {Object.entries(advancedTechniques).map(([tech, value]) => (
              <div key={tech} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                    {techniqueNames[tech]}
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleAdvancedTechniqueChange(tech, e.target.value)}
                    min="0"
                    max="100"
                    style={{
                      width: '70px',
                      padding: '0.4rem',
                      fontSize: '0.9rem',
                      border: '2px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      textAlign: 'center'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ 
                    flex: 1,
                    height: '8px', 
                    background: '#e2e8f0', 
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${value}%`,
                      height: '100%',
                      background: '#ec4899',
                      transition: 'width 0.3s'
                    }}></div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', minWidth: '60px' }}>
                    {previewDistribution && previewDistribution[tech] !== undefined 
                      ? `${previewDistribution[tech]} jogos` 
                      : `≈ ${Math.round((value / 100) * totalGames)} jogos`}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🔲 Supressão de Quadrantes (Opcional)</h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={useQuadrants}
              onChange={(e) => setUseQuadrants(e.target.checked)}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>Ativar Quadrantes</span>
          </label>
        </div>

        {useQuadrants && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: '600' }}>
                Porcentagem de jogos com quadrantes suprimidos:
              </label>
              <input
                type="number"
                value={quadrantDistribution}
                onChange={(e) => setQuadrantDistribution(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                min="0"
                max="100"
                style={{
                  width: '120px',
                  padding: '0.5rem',
                  fontSize: '1rem',
                  border: '2px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'center'
                }}
              />
              <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {previewDistribution && previewDistribution.quadrants !== undefined
                  ? `${previewDistribution.quadrants} jogos`
                  : `≈ ${Math.round((quadrantDistribution / 100) * totalGames)} jogos`}
              </span>
            </div>
                  
            <div style={{ marginBottom: '1rem', padding: '1rem', background: '#fef3c7', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', color: '#92400e' }}>
              <strong>💡 Dica:</strong> Clique nos quadrantes abaixo para suprimi-los (máx: 2)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {analysis && analysis.map((quad, idx) => {
            const isSuppressed = suppressedQuadrants.includes(idx);            
            return (
              <div
                key={idx}
                onClick={() => toggleQuadrant(idx)}
                style={{
                  padding: '1.5rem',
                  background: isSuppressed ? '#fee2e2' : quad.status === 'QUENTE' ? '#fef3c7' : '#f0fdf4',
                  border: `3px solid ${isSuppressed ? '#dc2626' : quad.status === 'QUENTE' ? '#f59e0b' : '#22c55e'}`,
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  position: 'relative',
                  opacity: isSuppressed ? 0.7 : 1
                }}
              >
                {isSuppressed && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: '#dc2626',
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: '700'
                  }}>
                    SUPRIMIDO
                  </div>
                )}
                
                <div style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1e293b' }}>
                  {quad.name}
                </div>
                
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  Números: {quad.range[0]}-{quad.range[1]}
                </div>
                
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                    Frequência
                  </div>
                  <div style={{ 
                    height: '8px', 
                    background: '#e2e8f0', 
                    borderRadius: '4px',
                    overflow: 'hidden',
                    margin: '0 auto',
                    maxWidth: '150px'
                  }}>
                    <div style={{
                      width: `${quad.hotness}%`,
                      height: '100%',
                      background: quad.status === 'QUENTE' ? '#f59e0b' : '#22c55e',
                      transition: 'width 0.3s'
                    }}></div>
                  </div>
                </div>
                
                <div style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: '700',
                  color: quad.status === 'QUENTE' ? '#f59e0b' : quad.status === 'FRIO' ? '#3b82f6' : '#22c55e'
                }}>
                  {quad.status === 'QUENTE' ? '🔥' : quad.status === 'FRIO' ? '❄️' : '✓'} {quad.status} ({quad.hotness.toFixed(0)}%)
                </div>
              </div>
            );
          })}
            </div>
          </>
        )}
      </div>

      {previewDistribution && totalGames > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">👁️ Preview da Distribuição</h3>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Distribuição exata que será gerada - 100% jogos únicos
            </div>
          </div>

          <div style={{ 
            padding: '1.5rem', 
            background: '#f0f9ff', 
            borderRadius: 'var(--radius-md)',
            border: '2px solid #3b82f6'
          }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem' 
            }}>
              {Object.entries(previewDistribution)
                .filter(([_, count]) => count > 0)
                .sort((a, b) => b[1] - a[1])
                .map(([tech, count]) => {
                  const percentage = ((count / totalGames) * 100).toFixed(1);
                  return (
                    <div key={tech} style={{
                      padding: '1rem',
                      background: 'white',
                      borderRadius: 'var(--radius-md)',
                      border: '2px solid #bfdbfe',
                      textAlign: 'center'
                    }}>
                      <div style={{ 
                        fontSize: '0.85rem', 
                        color: '#1e40af', 
                        marginBottom: '0.5rem',
                        fontWeight: '600'
                      }}>
                        {techniqueNames[tech]}
                      </div>
                      <div style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700', 
                        color: '#1e3a8a',
                        marginBottom: '0.25rem'
                      }}>
                        {count}
                      </div>
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: '#3b82f6',
                        fontWeight: '600'
                      }}>
                        {percentage}%
                      </div>
                    </div>
                  );
                })}
            </div>

            <div style={{ 
              marginTop: '1rem', 
              padding: '0.75rem', 
              background: '#dcfce7', 
              borderRadius: 'var(--radius-sm)',
              textAlign: 'center',
              fontSize: '0.9rem',
              color: '#166534',
              fontWeight: '600'
            }}>
              ✅ Total: {Object.values(previewDistribution).reduce((sum, val) => sum + val, 0)} jogos únicos garantidos
            </div>
          </div>
        </div>
      )}

      <button
        onClick={generateGames}
        disabled={loading || totalGames < 1}
        className="btn btn-primary btn-lg"
        style={{ 
          width: '100%',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
          fontSize: '1.2rem',
          padding: '1.25rem'
        }}
      >
        {loading ? '⏳ Gerando Jogos...' : `🎲 Gerar ${totalGames} Jogos Únicos`}
      </button>

      {loading && (
        <div className="card">
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Gerando {totalGames} jogos 100% únicos...</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Validação anti-duplicatas ativada
            </p>
          </div>
        </div>
      )}

      {generatedGames && stats && !loading && (
        <>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📊 Estatísticas Gerais</h3>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => reportService.downloadDetailedCSV({
                    generatedGames,
                    stats,
                    budget,
                    numbersPerGame,
                    ticketPrice
                  })} 
                  className="btn"
                  style={{ background: '#22c55e', color: 'white', padding: '0.75rem 1.5rem' }}
                >
                  📥 CSV Detalhado
                </button>
                
                <button 
                  onClick={() => reportService.downloadHTMLReport({
                    generatedGames,
                    stats,
                    budget,
                    numbersPerGame,
                    ticketPrice,
                    period
                  })} 
                  className="btn"
                  style={{ background: '#3b82f6', color: 'white', padding: '0.75rem 1.5rem' }}
                >
                  📄 Relatório HTML
                </button>
                
                <button 
                  onClick={() => reportService.printReport({
                    generatedGames,
                    stats,
                    budget,
                    numbersPerGame,
                    ticketPrice,
                    period
                  })} 
                  className="btn"
                  style={{ background: '#8b5cf6', color: 'white', padding: '0.75rem 1.5rem' }}
                >
                  🖨️ Imprimir
                </button>
                
                <button 
                  onClick={() => reportService.downloadJSON({
                    generatedGames,
                    stats,
                    budget,
                    numbersPerGame,
                    ticketPrice
                  })} 
                  className="btn"
                  style={{ background: '#f59e0b', color: 'white', padding: '0.75rem 1.5rem' }}
                >
                  📊 JSON
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ padding: '1.5rem', background: '#dbeafe', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: '#1e40af', marginBottom: '0.5rem' }}>Total de Jogos</div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e3a8a' }}>{stats.totalGames}</div>
              </div>

              <div style={{ padding: '1.5rem', background: '#dcfce7', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: '#166534', marginBottom: '0.5rem' }}>Investimento</div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#15803d' }}>
                  R$ {(stats.totalGames * aiService.calculateCost(numbersPerGame, ticketPrice)).toFixed(2)}
                </div>
              </div>

              <div style={{ padding: '1.5rem', background: '#fef3c7', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: '#92400e', marginBottom: '0.5rem' }}>Números Únicos</div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#92400e' }}>{stats.uniqueNumbers}</div>
                <div style={{ fontSize: '0.75rem', color: '#f59e0b' }}>de 60</div>
              </div>

              <div style={{ padding: '1.5rem', background: '#ede9fe', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: '#6d28d9', marginBottom: '0.5rem' }}>Período</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#5b21b6' }}>{stats.period}</div>
              </div>

              <div style={{ padding: '1.5rem', background: '#fee2e2', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: '#991b1b', marginBottom: '0.5rem' }}>Nums/Jogo</div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#991b1b' }}>{stats.numbersPerGame}</div>
              </div>

              <div style={{ padding: '1.5rem', background: '#f0fdfa', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: '#134e4a', marginBottom: '0.5rem' }}>Média/Número</div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#115e59' }}>{stats.avgPerNumber}</div>
              </div>
            </div>

            <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>🎯 Distribuição Final (Confirmação)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
              {Object.entries(stats.distribution)
                .filter(([_, count]) => count > 0)
                .map(([tech, count]) => (
                <div key={tech} style={{ 
                  padding: '0.875rem', 
                  background: 'var(--card-bg)', 
                  border: '2px solid var(--border-color)', 
                  borderRadius: 'var(--radius-md)' 
                }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    {techniqueNames[tech]}
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {count} jogos
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {((count / stats.totalGames) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>

            <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>⚖️ Balanceamento Par/Ímpar</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ padding: '1rem', background: '#dbeafe', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: '#1e40af', marginBottom: '0.5rem' }}>Pares</div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e3a8a' }}>
                  {stats.evenOdd.even} ({stats.evenOdd.evenPercentage}%)
                </div>
              </div>
              <div style={{ padding: '1rem', background: '#dcfce7', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: '#166534', marginBottom: '0.5rem' }}>Ímpares</div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#15803d' }}>
                  {stats.evenOdd.odd} ({stats.evenOdd.oddPercentage}%)
                </div>
              </div>
            </div>

            <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>📊 Distribuição por Dezena</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              {Object.entries(stats.decadeDistribution).map(([range, count]) => (
                <div key={range} style={{ 
                  padding: '1rem', 
                  background: 'var(--card-bg)', 
                  border: '2px solid var(--border-color)', 
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    {range}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {count}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {((count / (stats.totalGames * numbersPerGame)) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">🎲 Todos os Jogos ({generatedGames.length}) - 100% Únicos</h3>
            </div>

            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {generatedGames.map((game, idx) => (
                <div key={idx} style={{ 
                  marginBottom: '1rem', 
                  padding: '1.5rem', 
                  background: idx % 2 === 0 ? '#f8fafc' : 'white', 
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                      Jogo {idx + 1}
                    </strong>
                    <span style={{ 
                      fontSize: '0.8rem', 
                      padding: '0.25rem 0.75rem', 
                      background: '#8b5cf6', 
                      color: 'white', 
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: '600'
                    }}>
                      {game.techniqueName}
                    </span>
                  </div>
                  <div className="numbers-grid">
                    {game.numbers.map((num, numIdx) => (
                      <div key={numIdx} className="number-ball" style={{ 
                        background: '#8b5cf6',
                        border: '3px solid #6d28d9'
                      }}>
                        {String(num).padStart(2, '0')}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  );
}

export default BudgetGenerator;
