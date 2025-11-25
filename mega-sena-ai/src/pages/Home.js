import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dataService from '../services/dataService';

function Home() {
  const navigate = useNavigate();
  const [hasData, setHasData] = useState(false);
  const [stats, setStats] = useState(null);

  // Função auxiliar para extrair campo do contest
  const getField = (contest, ...fieldNames) => {
    for (const field of fieldNames) {
      if (contest[field] !== undefined && contest[field] !== null && contest[field] !== '') {
        return contest[field];
      }
    }
    return null;
  };

  useEffect(() => {
    const loaded = dataService.hasData();
    setHasData(loaded);
    
    if (loaded) {
      const contests = dataService.contests;
      
      if (!contests || contests.length === 0) {
        setHasData(false);
        return;
      }

      const lastContest = contests[contests.length - 1];
      const firstContest = contests[0];
      
      console.log('First Contest:', firstContest);
      console.log('Last Contest:', lastContest);
      
      // Extrair número do concurso
      const lastContestNumber = getField(lastContest, 'contest', 'Concurso', 'concurso', 'numero', 'Numero');
      const firstContestNumber = getField(firstContest, 'contest', 'Concurso', 'concurso', 'numero', 'Numero');
      
      // Extrair data
      const lastContestDate = getField(lastContest, 'date', 'Data', 'data');
      const firstContestDate = getField(firstContest, 'date', 'Data', 'data');
      
      // Extrair números sorteados
      let lastNumbers = [];
      if (lastContest.numbers && Array.isArray(lastContest.numbers)) {
        lastNumbers = lastContest.numbers;
      } else {
        // Tentar extrair de Bola1, Bola2, etc.
        for (let i = 1; i <= 6; i++) {
          const bola = getField(lastContest, `Bola${i}`, `bola${i}`, `num${i}`, `Num${i}`);
          if (bola) {
            lastNumbers.push(parseInt(bola));
          }
        }
      }
      
      setStats({
        totalContests: contests.length,
        lastContest: lastContestNumber || contests.length,
        lastDate: lastContestDate || 'Data não disponível',
        lastNumbers: lastNumbers,
        firstContest: firstContestNumber || 1,
        firstDate: firstContestDate || 'Data não disponível'
      });
    }
  }, []);

  const menuItems = [
    {
      title: '📊 Análises Estatísticas',
      description: 'Visualize números mais/menos sorteados, duplas, trios e distribuições',
      path: '/analytics',
      color: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
      icon: '📊',
      features: ['Frequência de números', 'Duplas e trios', 'Análise par/ímpar', 'Distribuição por dezenas']
    },
    {
      title: '🤖 Gerador IA',
      description: '6 técnicas de inteligência artificial para gerar apostas inteligentes',
      path: '/predictor',
      color: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      icon: '🤖',
      features: ['Híbrida multi-algoritmo', 'Rede neural ponderada', 'Números atrasados', 'Desdobramentos']
    },
    {
      title: '🔲 Supressão de Quadrantes',
      description: 'Exclua quadrantes e gere números apenas com as faixas ativas',
      path: '/quadrantes',
      color: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
      icon: '🔲',
      features: ['4 quadrantes (01-60)', 'Análise quente/frio', 'Sugestão IA', 'Geração restrita']
    },
    {
      title: '🧠 Técnicas Avançadas',
      description: 'Algoritmos de ciência de dados sem necessidade de treinamento',
      path: '/tecnicas-avancadas',
      color: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      icon: '🧠',
      features: ['Análise de ciclos', 'Grafos (co-ocorrência)', 'Cadeias de Markov', 'Correlação estatística']
    },
    {
      title: '⚙️ Configurações',
      description: 'Importe dados históricos e gerencie configurações do sistema',
      path: '/settings',
      color: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
      icon: '⚙️',
      features: ['Importar CSV/XLSX', 'Validação automática', 'Estatísticas gerais', 'Configurações globais']
    }
  ];

  return (
    <div className="page-content">
      
      {/* Header com Boas-vindas */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: 'white', border: 'none' }}>
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍀</div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '700' }}>
            Bem-vindo ao Mega-Sena AI
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.95 }}>
            Sistema Inteligente de Análise e Predição
          </p>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      {hasData && stats ? (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📈 Dados Carregados</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            
            {/* Total de Sorteios */}
            <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', borderRadius: 'var(--radius-lg)', border: '2px solid #3b82f6' }}>
              <div style={{ fontSize: '0.9rem', color: '#1e40af', marginBottom: '0.5rem', fontWeight: '600' }}>
                Total de Sorteios
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e3a8a', marginBottom: '0.5rem' }}>
                {stats.totalContests.toLocaleString('pt-BR')}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#3b82f6' }}>
                De <strong>#{stats.firstContest}</strong> até <strong>#{stats.lastContest}</strong>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#60a5fa', marginTop: '0.25rem' }}>
                {stats.firstDate} - {stats.lastDate}
              </div>
            </div>

            {/* Último Sorteio */}
            <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', borderRadius: 'var(--radius-lg)', border: '2px solid #22c55e' }}>
              <div style={{ fontSize: '0.9rem', color: '#166534', marginBottom: '0.5rem', fontWeight: '600' }}>
                Último Sorteio
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#14532d', marginBottom: '0.25rem' }}>
                Nº {stats.lastContest}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#16a34a', fontWeight: '600' }}>
                {stats.lastDate}
              </div>
            </div>

            {/* Números do Último Sorteio */}
            <div style={{ 
              padding: '1.5rem', 
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
              borderRadius: 'var(--radius-lg)', 
              border: '2px solid #f59e0b',
              gridColumn: stats.lastNumbers.length > 0 ? 'span 1' : '1'
            }}>
              <div style={{ fontSize: '0.9rem', color: '#92400e', marginBottom: '0.75rem', fontWeight: '600' }}>
                Números Sorteados
              </div>
              {stats.lastNumbers.length > 0 ? (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {stats.lastNumbers.map((num, idx) => (
                    <div key={idx} style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: '#f59e0b',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '1rem',
                      border: '3px solid #92400e',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      {String(num).padStart(2, '0')}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.9rem', color: '#92400e' }}>
                  Números não disponíveis
                </div>
              )}
            </div>

          </div>
        </div>
      ) : (
        <div className="alert alert-warning">
          <span>⚠️</span>
          <div>
            <strong>Nenhum dado carregado.</strong>
            <button 
              onClick={() => navigate('/settings')} 
              style={{ 
                marginLeft: '1rem', 
                padding: '0.5rem 1rem', 
                background: '#f59e0b', 
                color: 'white', 
                border: 'none', 
                borderRadius: 'var(--radius-md)', 
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Importar Dados Agora
            </button>
          </div>
        </div>
      )}

      {/* Cards de Funcionalidades */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
        {menuItems.map((item, idx) => (
          <div
            key={idx}
            onClick={() => navigate(item.path)}
            style={{
              background: 'var(--card-bg)',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid var(--border-color)',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
              e.currentTarget.style.borderColor = item.color.match(/#[0-9a-f]{6}/i)[0];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            {/* Header colorido */}
            <div style={{
              background: item.color,
              color: 'white',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{item.icon}</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700', margin: 0 }}>
                {item.title.replace(/^[^\s]+\s/, '')}
              </h3>
            </div>

            {/* Conteúdo */}
            <div style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {item.description}
              </p>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                  ✨ Recursos:
                </div>
                {item.features.map((feature, fidx) => (
                  <div key={fidx} style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.5rem',
                    paddingLeft: '1rem',
                    position: 'relative'
                  }}>
                    <span style={{ position: 'absolute', left: 0, color: '#22c55e' }}>✓</span>
                    {feature}
                  </div>
                ))}
              </div>

              <button
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: item.color,
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Acessar Agora →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Rodapé com dicas */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', border: '2px solid #cbd5e1' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💡</div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.75rem', color: '#1e293b' }}>
            Dicas de Uso
          </h3>
          <div style={{ maxWidth: '800px', margin: '0 auto', fontSize: '0.95rem', color: '#475569', lineHeight: '1.8' }}>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>1.</strong> Comece importando dados históricos em <strong>Configurações</strong>
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>2.</strong> Explore as <strong>Análises Estatísticas</strong> para entender padrões
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>3.</strong> Use o <strong>Gerador IA</strong> ou <strong>Técnicas Avançadas</strong> para gerar números
            </p>
            <p>
              <strong>4.</strong> Aplique <strong>desdobramentos</strong> para otimizar custos e garantias
            </p>
          </div>
        </div>
      </div>

      {/* Aviso Legal */}
      <div className="alert alert-warning">
        <span style={{ fontSize: '1.3rem' }}>⚠️</span>
        <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
          <strong>Aviso Legal:</strong> Este sistema utiliza análises estatísticas e algoritmos de ciência de dados. 
          Não há garantia de acertos. A Mega-Sena é um jogo de sorteio aleatório. Jogue com responsabilidade.
        </div>
      </div>

    </div>
  );
}

export default Home;
