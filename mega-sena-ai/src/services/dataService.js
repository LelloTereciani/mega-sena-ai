const STORAGE_KEY = 'megasena_contests_data';

class DataService {
  constructor() {
    this.contests = this.loadFromStorage();
  }

  // Carrega dados do localStorage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        console.log('✅ Dados carregados do localStorage:', data.length, 'concursos');
        return data;
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
    }
    return [];
  }

  // Salva dados no localStorage
  saveToStorage(contests) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contests));
      console.log('✅ Dados salvos no localStorage:', contests.length, 'concursos');
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar dados:', error);
      return false;
    }
  }

  // Verifica se já existem dados
  hasData() {
    return this.contests && this.contests.length > 0;
  }

  // Limpa dados
  clearData() {
    this.contests = [];
    localStorage.removeItem(STORAGE_KEY);
  }

  // Carrega do Excel via backend Python
  async loadFromExcel(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:3001/api/process-excel', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.contests) {
        this.contests = result.contests;
        this.saveToStorage(this.contests);
        
        return {
          success: true,
          contests: this.contests,
          count: this.contests.length
        };
      } else {
        return {
          success: false,
          error: result.error || 'Erro ao processar arquivo'
        };
      }
    } catch (error) {
      console.error('❌ Erro:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Carrega de arquivo TXT
  async loadFromText(file) {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      const contests = [];
      
      for (const line of lines) {
        const parts = line.split(/[\t;,]/);
        
        if (parts.length >= 8) {
          const contestNumber = parseInt(parts[0]);
          const date = parts[1];
          const numbers = parts.slice(2, 8).map(n => parseInt(n)).filter(n => !isNaN(n));
          
          if (!isNaN(contestNumber) && numbers.length === 6) {
            contests.push({
              contestNumber,
              date,
              numbers: numbers.sort((a, b) => a - b)
            });
          }
        }
      }

      if (contests.length > 0) {
        contests.sort((a, b) => a.contestNumber - b.contestNumber);
        this.contests = contests;
        this.saveToStorage(this.contests);

        return {
          success: true,
          contests: this.contests,
          count: this.contests.length
        };
      } else {
        return {
          success: false,
          error: 'Nenhum dado válido encontrado no arquivo'
        };
      }
    } catch (error) {
      console.error('❌ Erro:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Retorna estatísticas básicas
  getStats() {
    if (!this.hasData()) return null;

    return {
      total: this.contests.length,
      first: this.contests[0],
      last: this.contests[this.contests.length - 1]
    };
  }
}

export default new DataService();
