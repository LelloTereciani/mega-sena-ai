import React, { useState, useEffect } from 'react';
import dataService from '../services/dataService';
import { useNavigate } from 'react-router-dom';

function Settings() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ticketPrice, setTicketPrice] = useState('5.00');
  const [savedPrice, setSavedPrice] = useState(false);
  const [existingData, setExistingData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Carrega preço salvo
    const saved = localStorage.getItem('megasena_ticket_price');
    if (saved) {
      setTicketPrice(saved);
    }

    // Verifica se já existem dados
    if (dataService.hasData()) {
      const stats = dataService.getStats();
      setExistingData(stats);
    }
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (existingData) {
      const confirm = window.confirm(
        `Já existem ${existingData.total} concursos carregados.\n\n` +
        `Deseja SUBSTITUIR os dados existentes pelos novos?\n\n` +
        `Esta ação não pode ser desfeita.`
      );
      
      if (!confirm) return;
    }

    setLoading(true);
    setError(null);

    try {
      const fileType = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') ? 'EXCEL' : 'TXT';
      
      let result;
      if (fileType === 'EXCEL') {
        result = await dataService.loadFromExcel(file);
      } else {
        result = await dataService.loadFromText(file);
      }

      if (result.success) {
        setContests(result.contests);
        const stats = dataService.getStats();
        setExistingData(stats);
        
        setTimeout(() => {
          navigate('/');
        }, 2500);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrice = () => {
    const price = parseFloat(ticketPrice);
    if (isNaN(price) || price <= 0) {
      alert('Digite um preço válido!');
      return;
    }
    
    localStorage.setItem('megasena_ticket_price', ticketPrice);
    setSavedPrice(true);
    
    setTimeout(() => setSavedPrice(false), 3000);
  };

  const handleClearData = () => {
    const confirm = window.confirm(
      'Tem certeza que deseja EXCLUIR todos os dados carregados?\n\n' +
      'Esta ação não pode ser desfeita.'
    );
    
    if (confirm) {
      dataService.clearData();
      setExistingData(null);
      alert('Dados excluídos com sucesso!');
    }
  };

  const lastContest = contests.length > 0 ? contests[contests.length - 1] : null;

  return (
    <div className="page-content">
      
      {/* Status dos Dados */}
      {existingData && (
        <div className="alert alert-success">
          <span>✅</span>
          <div>
            <strong>Base de dados carregada:</strong> {existingData.total.toLocaleString('pt-BR')} concursos 
            (#{existingData.first.contestNumber} até #{existingData.last.contestNumber})
            <div style={{ fontSize: '0.85rem', marginTop: '0.25rem', opacity: 0.9 }}>
              Último sorteio: {existingData.last.date}
            </div>
          </div>
        </div>
      )}

      {/* Upload de Dados */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">📂 {existingData ? 'Atualizar' : 'Importar'} Base de Dados</h3>
            <p className="card-subtitle">
              {existingData 
                ? 'Substitua os dados atuais por uma versão atualizada com novos sorteios'
                : 'Carregue o histórico completo dos sorteios da Mega-Sena'
              }
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: existingData ? '1fr 1fr 1fr' : '1fr 1fr', gap: '2rem' }}>
          
          {/* Upload */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
              {existingData ? '🔄 Atualizar Dados' : '📥 Importar Dados'}
            </h4>
            
            <p style={{ 
              fontSize: '0.9rem', 
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem',
              lineHeight: '1.6'
            }}>
              {existingData 
                ? 'Faça upload de um arquivo atualizado. Os dados antigos serão substituídos.'
                : 'Faça upload do arquivo com todos os resultados históricos.'
              }
            </p>

            <label 
              htmlFor="file-upload" 
              className="btn btn-primary btn-lg"
              style={{ width: '100%', cursor: 'pointer' }}
            >
              📂 Selecionar Arquivo
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls,.txt"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />

            <div style={{ 
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'var(--background)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)'
            }}>
              <strong>📋 Formatos:</strong> .xlsx, .xls, .txt<br/>
              <strong>✅ Colunas:</strong> Concurso, Data, Dezenas 1-6
            </div>
          </div>

          {/* Status/Preview */}
          <div>
            {loading && (
              <div className="card" style={{ background: 'var(--background)' }}>
                <div className="loading-container">
                  <div className="spinner"></div>
                  <p className="loading-text">Processando...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="alert alert-error">
                <span>❌</span>
                <div><strong>Erro:</strong><br/>{error}</div>
              </div>
            )}

            {lastContest && (
              <div className="alert alert-success">
                <span>✅</span>
                <div>
                  <strong>Importação concluída!</strong><br/>
                  📊 Total: {contests.length} concursos<br/>
                  🎯 Último: #{lastContest.contestNumber} - {lastContest.date}<br/>
                  <em style={{ fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>
                    Redirecionando...
                  </em>
                </div>
              </div>
            )}

            {!loading && !error && !lastContest && existingData && (
              <div style={{ 
                padding: '1.5rem',
                background: 'var(--background)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)'
              }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '1rem' }}>
                  📊 Dados Atuais
                </h4>
                <div style={{ fontSize: '0.9rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                  <div><strong>Total:</strong> {existingData.total} concursos</div>
                  <div><strong>Período:</strong> #{existingData.first.contestNumber} - #{existingData.last.contestNumber}</div>
                  <div><strong>Último:</strong> {existingData.last.date}</div>
                </div>
              </div>
            )}

            {!loading && !error && !lastContest && !existingData && (
              <div style={{ 
                textAlign: 'center',
                padding: '2rem',
                background: 'var(--background)',
                borderRadius: 'var(--radius-lg)',
                border: '2px dashed var(--border-color)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📊</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Nenhum dado carregado
                </p>
              </div>
            )}
          </div>

          {/* Limpar Dados */}
          {existingData && (
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#dc2626' }}>
                🗑️ Gerenciar Dados
              </h4>
              
              <p style={{ 
                fontSize: '0.9rem', 
                color: 'var(--text-secondary)',
                marginBottom: '1.5rem',
                lineHeight: '1.6'
              }}>
                Exclua todos os dados armazenados se necessário. Esta ação é irreversível.
              </p>

              <button 
                onClick={handleClearData}
                className="btn"
                style={{ 
                  width: '100%',
                  background: '#dc2626',
                  color: 'white'
                }}
              >
                🗑️ Excluir Todos os Dados
              </button>

              <div style={{ 
                marginTop: '1.5rem',
                padding: '1rem',
                background: '#fee2e2',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                color: '#991b1b',
                border: '1px solid #fca5a5'
              }}>
                <strong>⚠️ Cuidado:</strong> Esta ação não pode ser desfeita. Você precisará importar os dados novamente.
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Configuração de Preço */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">💰 Preço do Bolhete</h3>
            <p className="card-subtitle">
              Configure o valor para cálculo automático de custos
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.75rem',
              fontSize: '0.95rem',
              fontWeight: '600'
            }}>
              Valor do Bolhete Único (6 números):
            </label>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{ 
                  position: 'absolute', 
                  left: '1rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: 'var(--text-secondary)'
                }}>
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={ticketPrice}
                  onChange={(e) => setTicketPrice(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem 0.875rem 3rem',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    border: '2px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)'
                  }}
                />
              </div>
              
              <button 
                onClick={handleSavePrice}
                className="btn btn-primary"
                style={{ padding: '0.875rem 2rem' }}
              >
                💾 Salvar
              </button>
            </div>

            {savedPrice && (
              <div className="alert alert-success" style={{ marginTop: '1rem' }}>
                <span>✅</span>
                <span>Preço salvo!</span>
              </div>
            )}
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '1rem' }}>
              📊 Referência de Custos
            </h4>
            <div style={{ 
              background: 'var(--background)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              fontSize: '0.85rem'
            }}>
              {[
                { n: 6, c: 1 }, { n: 7, c: 7 }, { n: 8, c: 28 }, 
                { n: 9, c: 84 }, { n: 10, c: 210 }, { n: 15, c: 5005 }, { n: 20, c: 38760 }
              ].map((item, idx) => (
                <div key={idx} style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  background: idx % 2 === 0 ? 'white' : 'transparent'
                }}>
                  <span><strong>{item.n} números</strong></span>
                  <span style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                    R$ {(parseFloat(ticketPrice) * item.c).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Settings;
