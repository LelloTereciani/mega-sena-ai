class AIService {

  // Gera predição baseada em técnica selecionada
  generatePrediction(contests, count, technique, fixedNumbers = []) {
    let numbers = [...fixedNumbers];
    const needed = count - fixedNumbers.length;

    switch (technique) {
      case 'frequency':
        numbers = numbers.concat(this.frequencyBased(contests, needed));
        break;
      case 'recent':
        numbers = numbers.concat(this.recentPattern(contests, needed));
        break;
      case 'evenodd':
        numbers = numbers.concat(this.evenOddBalance(contests, needed));
        break;
      case 'decades':
        numbers = numbers.concat(this.decadeDistribution(contests, needed));
        break;
      case 'neural':
        numbers = numbers.concat(this.neuralWeighted(contests, needed));
        break;
      case 'hybrid':
      default:
        numbers = numbers.concat(this.hybridApproach(contests, needed));
    }

    return {
      numbers: numbers.sort((a, b) => a - b),
      method: this.getTechniqueName(technique),
      confidence: this.calculateConfidence(numbers, contests),
      fixedNumbers: fixedNumbers.length,
      timestamp: new Date().toLocaleString('pt-BR')
    };
  }

  // Geração com números restritos (para quadrantes)
  generatePredictionWithConstraints(contests, count, technique, fixedNumbers = [], allowedNumbers = null) {
    const availableNumbers = allowedNumbers || Array.from({ length: 60 }, (_, i) => i + 1);
    
    if (availableNumbers.length < count) {
      throw new Error(`Necessário pelo menos ${count} números disponíveis`);
    }

    let numbers = [];
    
    // Adiciona números fixos
    fixedNumbers.forEach(num => {
      if (availableNumbers.includes(num) && !numbers.includes(num)) {
        numbers.push(num);
      }
    });

    // Gera números restantes usando a técnica escolhida
    const needed = count - numbers.length;
    const candidates = availableNumbers.filter(n => !numbers.includes(n));

    switch (technique) {
      case 'frequency':
        numbers = numbers.concat(this.frequencyBasedConstrained(contests, needed, candidates));
        break;
      case 'recent':
        numbers = numbers.concat(this.recentPatternConstrained(contests, needed, candidates));
        break;
      case 'neural':
        numbers = numbers.concat(this.neuralWeightedConstrained(contests, needed, candidates));
        break;
      default:
        numbers = numbers.concat(this.hybridApproachConstrained(contests, needed, candidates));
    }

    return {
      numbers: numbers.sort((a, b) => a - b),
      method: this.getTechniqueName(technique),
      confidence: this.calculateConfidence(numbers, contests),
      fixedNumbers: fixedNumbers.length,
      timestamp: new Date().toLocaleString('pt-BR')
    };
  }

  // Técnica 1: Baseada em Frequência
  frequencyBased(contests, count) {
    const frequency = this.calculateFrequency(contests);
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([num]) => parseInt(num));
  }

  frequencyBasedConstrained(contests, count, allowedNumbers) {
    const frequency = this.calculateFrequency(contests);
    return Object.entries(frequency)
      .filter(([num]) => allowedNumbers.includes(parseInt(num)))
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([num]) => parseInt(num));
  }

  // Técnica 2: Padrões Recentes
  recentPattern(contests, count) {
    const recent = contests.slice(-50);
    const frequency = this.calculateFrequency(recent);
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([num]) => parseInt(num));
  }

  recentPatternConstrained(contests, count, allowedNumbers) {
    const recent = contests.slice(-50);
    const frequency = this.calculateFrequency(recent);
    return Object.entries(frequency)
      .filter(([num]) => allowedNumbers.includes(parseInt(num)))
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([num]) => parseInt(num));
  }

  // Técnica 3: Balanceamento Par/Ímpar
  evenOddBalance(contests, count) {
    const frequency = this.calculateFrequency(contests);
    const sorted = Object.entries(frequency).sort((a, b) => b[1] - a[1]);
    
    const numbers = [];
    const targetEven = Math.floor(count / 2);
    let evenCount = 0;

    for (const [num, freq] of sorted) {
      const n = parseInt(num);
      if (numbers.length >= count) break;
      
      if (n % 2 === 0 && evenCount < targetEven) {
        numbers.push(n);
        evenCount++;
      } else if (n % 2 !== 0 && numbers.length - evenCount < count - targetEven) {
        numbers.push(n);
      }
    }

    while (numbers.length < count) {
      for (let i = 1; i <= 60; i++) {
        if (!numbers.includes(i)) {
          numbers.push(i);
          break;
        }
      }
    }

    return numbers;
  }

  // Técnica 4: Distribuição por Dezenas
  decadeDistribution(contests, count) {
    const decades = [
      [1, 10], [11, 20], [21, 30], [31, 40], [41, 50], [51, 60]
    ];
    
    const numbersPerDecade = Math.ceil(count / 6);
    const numbers = [];
    
    decades.forEach(([start, end]) => {
      const frequency = this.calculateFrequency(contests);
      const decadeNums = Object.entries(frequency)
        .filter(([num]) => {
          const n = parseInt(num);
          return n >= start && n <= end;
        })
        .sort((a, b) => b[1] - a[1])
        .slice(0, numbersPerDecade)
        .map(([num]) => parseInt(num));
      
      numbers.push(...decadeNums);
    });

    return numbers.slice(0, count);
  }

  // Técnica 5: Rede Neural Ponderada
  neuralWeighted(contests, count) {
    const frequency = this.calculateFrequency(contests);
    const recent = contests.slice(-30);
    const recentFreq = this.calculateFrequency(recent);
    
    const weights = {};
    for (let i = 1; i <= 60; i++) {
      const histWeight = frequency[i] || 0;
      const recentWeight = (recentFreq[i] || 0) * 3;
      weights[i] = histWeight + recentWeight;
    }

    const selected = [];
    while (selected.length < count) {
      const num = this.weightedRandom(weights, selected);
      if (num && !selected.includes(num)) {
        selected.push(num);
      }
    }

    return selected;
  }

  neuralWeightedConstrained(contests, count, allowedNumbers) {
    const frequency = this.calculateFrequency(contests);
    const recent = contests.slice(-30);
    const recentFreq = this.calculateFrequency(recent);
    
    const weights = {};
    allowedNumbers.forEach(i => {
      const histWeight = frequency[i] || 0;
      const recentWeight = (recentFreq[i] || 0) * 3;
      weights[i] = histWeight + recentWeight;
    });

    const selected = [];
    while (selected.length < count) {
      const num = this.weightedRandom(weights, selected);
      if (num && !selected.includes(num) && allowedNumbers.includes(num)) {
        selected.push(num);
      }
    }

    return selected;
  }

  // Técnica 6: Híbrida (Multi-Algoritmo)
  hybridApproach(contests, count) {
    const frequency = this.calculateFrequency(contests);
    const recent = contests.slice(-30);
    const recentFreq = this.calculateFrequency(recent);
    
    const scores = {};
    for (let i = 1; i <= 60; i++) {
      const freqScore = (frequency[i] || 0) * 0.4;
      const recentScore = (recentFreq[i] || 0) * 0.6;
      scores[i] = freqScore + recentScore;
    }

    return Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([num]) => parseInt(num));
  }

  hybridApproachConstrained(contests, count, allowedNumbers) {
    const frequency = this.calculateFrequency(contests);
    const recent = contests.slice(-30);
    const recentFreq = this.calculateFrequency(recent);
    
    const scores = {};
    allowedNumbers.forEach(i => {
      const freqScore = (frequency[i] || 0) * 0.4;
      const recentScore = (recentFreq[i] || 0) * 0.6;
      scores[i] = freqScore + recentScore;
    });

    return Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([num]) => parseInt(num));
  }

  // Calcula frequência de números
  calculateFrequency(contests) {
    const frequency = {};
    for (let i = 1; i <= 60; i++) {
      frequency[i] = 0;
    }

    contests.forEach(contest => {
      contest.numbers.forEach(num => {
        frequency[num]++;
      });
    });

    return frequency;
  }

  // Seleção aleatória ponderada
  weightedRandom(weights, exclude = []) {
    const available = Object.entries(weights).filter(([num]) => !exclude.includes(parseInt(num)));
    const totalWeight = available.reduce((sum, [_, weight]) => sum + weight, 0);
    
    let random = Math.random() * totalWeight;
    
    for (const [num, weight] of available) {
      random -= weight;
      if (random <= 0) {
        return parseInt(num);
      }
    }
    
    return available.length > 0 ? parseInt(available[0][0]) : null;
  }

  // Calcula confiança da predição
  calculateConfidence(numbers, contests) {
    const frequency = this.calculateFrequency(contests);
    const avgFreq = numbers.reduce((sum, num) => sum + (frequency[num] || 0), 0) / numbers.length;
    const maxFreq = Math.max(...Object.values(frequency));
    
    return Math.round((avgFreq / maxFreq) * 100);
  }

  // Nome da técnica
  getTechniqueName(technique) {
    const names = {
      frequency: 'Análise de Frequência',
      recent: 'Padrões Recentes',
      evenodd: 'Balanceamento Par/Ímpar',
      decades: 'Distribuição por Dezenas',
      neural: 'Rede Neural Ponderada',
      hybrid: 'Híbrida (Multi-Algoritmo)'
    };
    return names[technique] || 'Técnica Desconhecida';
  }

  // Calcula custo
  calculateCost(numbersCount, ticketPrice = 5.00) {
    const combinations = this.calculateCombinations(numbersCount, 6);
    return combinations * ticketPrice;
  }

  // Calcula combinações
  calculateCombinations(n, k) {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    
    let result = 1;
    for (let i = 1; i <= k; i++) {
      result = result * (n - k + i) / i;
    }
    return Math.round(result);
  }
}

export default new AIService();
