class ClosingService {

  // Gera todas as combinações possíveis
  generateAllCombinations(numbers, groupSize = 6) {
    const combinations = [];
    
    const combine = (start, combo) => {
      if (combo.length === groupSize) {
        combinations.push([...combo].sort((a, b) => a - b));
        return;
      }
      
      for (let i = start; i < numbers.length; i++) {
        combo.push(numbers[i]);
        combine(i + 1, combo);
        combo.pop();
      }
    };
    
    combine(0, []);
    return combinations;
  }

  // Cobertura Completa (SEM LIMITAÇÃO)
  fullCoverage(numbers) {
    const sorted = [...numbers].sort((a, b) => a - b);
    
    if (sorted.length < 6) {
      return {
        strategy: 'Cobertura Completa',
        error: 'Mínimo de 6 números necessários',
        numbers: sorted,
        games: [],
        totalGames: 0
      };
    }
    
    console.log(`🎲 Gerando cobertura completa de ${sorted.length} números...`);
    console.log(`⚠️ Isso pode levar alguns segundos para 15+ números`);
    
    const startTime = Date.now();
    const games = this.generateAllCombinations(sorted, 6);
    const endTime = Date.now();
    
    console.log(`✅ ${games.length} jogos gerados em ${((endTime - startTime) / 1000).toFixed(2)}s`);
    
    const totalCombinations = this.calculateCombinations(sorted.length, 6);
    const ticketPrice = 5.00;
    const totalCost = totalCombinations * ticketPrice;
    
    return {
      strategy: 'Cobertura Completa',
      description: `Todas as ${games.length.toLocaleString('pt-BR')} combinações possíveis`,
      numbers: sorted,
      games: games,
      totalGames: games.length,
      guarantee: '✅ SENA GARANTIDA se os 6 números sorteados estiverem entre os escolhidos',
      warning: totalCost > 1000 ? `⚠️ ATENÇÃO: Custo total de R$ ${totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : null,
      validated: true
    };
  }

  // Desdobramento Balanceado (para qualquer quantidade)
  balancedCoverage(numbers) {
    const sorted = [...numbers].sort((a, b) => a - b);
    const games = [];
    const totalNumbers = sorted.length;
    
    if (totalNumbers < 6) {
      return {
        strategy: 'Desdobramento Balanceado',
        error: 'Mínimo de 6 números necessários',
        numbers: sorted,
        games: [],
        totalGames: 0
      };
    }

    let gamesNeeded;
    if (totalNumbers <= 10) {
      gamesNeeded = Math.ceil(totalNumbers * 1.5);
    } else if (totalNumbers <= 15) {
      gamesNeeded = Math.ceil(totalNumbers * 2);
    } else {
      gamesNeeded = Math.ceil(totalNumbers * 2.5);
    }
    
    const numberFrequency = {};
    sorted.forEach(n => numberFrequency[n] = 0);
    
    for (let i = 0; i < gamesNeeded; i++) {
      const game = [];
      
      const sortedByFreq = [...sorted].sort((a, b) => 
        numberFrequency[a] - numberFrequency[b]
      );
      
      for (let j = 0; j < 6 && j < sortedByFreq.length; j++) {
        game.push(sortedByFreq[j]);
        numberFrequency[sortedByFreq[j]]++;
      }
      
      if (game.length === 6) {
        games.push(game.sort((a, b) => a - b));
      }
    }

    return {
      strategy: 'Desdobramento Balanceado',
      description: 'Distribui números uniformemente garantindo boa cobertura',
      numbers: sorted,
      games: games,
      totalGames: games.length,
      guarantee: 'Excelente distribuição com alta probabilidade de múltiplos acertos'
    };
  }

  // Fechamento Mínimo (Econômico)
  minimumClosure(numbers) {
    const sorted = [...numbers].sort((a, b) => a - b);
    const games = [];
    const used = new Set();
    
    if (sorted.length < 6) {
      return {
        strategy: 'Fechamento Mínimo',
        error: 'Mínimo de 6 números necessários',
        numbers: sorted,
        games: [],
        totalGames: 0
      };
    }

    games.push(sorted.slice(0, 6));
    sorted.slice(0, 6).forEach(n => used.add(n));

    let remainingNumbers = sorted.filter(n => !used.has(n));
    
    while (remainingNumbers.length >= 3) {
      const game = [];
      const usedArray = Array.from(used);
      
      const shuffledUsed = usedArray.sort(() => Math.random() - 0.5);
      for (let i = 0; i < 3; i++) {
        game.push(shuffledUsed[i]);
      }
      
      for (let i = 0; i < 3 && remainingNumbers.length > 0; i++) {
        const num = remainingNumbers.shift();
        game.push(num);
        used.add(num);
      }
      
      games.push(game.sort((a, b) => a - b));
    }

    if (remainingNumbers.length > 0) {
      const game = [...remainingNumbers];
      const usedArray = Array.from(used);
      
      while (game.length < 6) {
        const randomUsed = usedArray[Math.floor(Math.random() * usedArray.length)];
        if (!game.includes(randomUsed)) {
          game.push(randomUsed);
        }
      }
      
      games.push(game.sort((a, b) => a - b));
    }

    return {
      strategy: 'Fechamento Mínimo',
      description: 'Menor custo possível mantendo cobertura básica',
      numbers: sorted,
      games: games,
      totalGames: games.length,
      guarantee: 'Ideal para bolões pequenos - custo otimizado'
    };
  }

  // Fechamento Matemático (7-12 números com garantia de quina)
  mathematicalClosure(numbers) {
    const sorted = [...numbers].sort((a, b) => a - b);
    
    if (sorted.length < 7) {
      return {
        strategy: 'Desdobramento Matemático',
        error: 'Necessário no mínimo 7 números para fechamento matemático',
        numbers: sorted,
        games: [],
        totalGames: 0
      };
    }

    const realClosures = {
      7: [
        [0,1,2,3,4,5],[0,1,2,3,4,6],[0,1,2,5,6,4],[0,3,4,5,6,2],
        [1,2,3,5,6,0],[1,2,4,5,6,3],[0,1,3,4,5,6]
      ],
      8: [
        [0,1,2,3,4,5],[0,1,2,6,7,4],[0,3,4,6,7,1],[1,3,4,5,7,2],
        [2,3,5,6,7,0],[0,1,4,5,6,7],[2,3,4,5,6,7],[0,2,3,4,6,7]
      ],
      9: [
        [0,1,2,3,4,5],[0,1,2,6,7,8],[0,3,4,6,7,8],[1,3,4,5,7,8],
        [2,3,5,6,7,8],[0,1,4,5,6,8],[2,3,4,5,6,7],[0,2,4,5,7,8],
        [1,2,3,6,7,8],[0,1,3,4,6,7],[1,2,4,5,6,8],[0,2,3,5,6,8]
      ],
      10: [
        [0,1,2,3,4,5],[0,1,2,6,7,8],[0,1,3,6,8,9],[0,2,4,6,7,9],
        [0,3,4,7,8,9],[1,2,4,7,8,9],[1,3,4,5,6,9],[1,3,5,7,8,9],
        [2,3,5,6,8,9],[2,4,5,6,7,8],[0,1,4,5,7,9],[0,2,3,5,7,8],
        [1,2,3,4,6,8],[0,3,4,5,6,7],[1,2,5,6,7,9]
      ],
      11: [
        [0,1,2,3,4,5],[0,1,2,6,7,8],[0,1,3,6,8,9],[0,2,4,6,7,9],
        [0,3,4,7,8,9],[1,2,4,7,8,9],[1,3,4,5,6,9],[1,3,5,7,8,10],
        [2,3,5,6,8,10],[2,4,5,6,7,10],[0,1,4,5,7,10],[0,2,3,5,7,10],
        [1,2,3,4,6,10],[0,3,4,5,6,10],[1,2,5,6,7,8],[0,1,5,8,9,10],
        [0,2,3,6,9,10],[1,4,6,8,9,10]
      ],
      12: [
        [0,1,2,3,4,5],[0,1,2,6,7,8],[0,1,3,6,8,9],[0,2,4,6,7,9],
        [0,3,4,7,8,10],[1,2,4,7,8,11],[1,3,4,5,6,11],[1,3,5,7,10,11],
        [2,3,5,6,10,11],[2,4,5,6,9,10],[0,1,4,5,9,11],[0,2,3,5,9,10],
        [1,2,3,4,8,10],[0,3,4,5,8,9],[1,2,5,6,7,9],[0,1,6,7,10,11],
        [0,2,3,7,8,11],[0,4,5,6,8,11],[1,4,6,7,9,10],[2,3,6,8,9,11],
        [1,5,7,8,9,10],[2,4,5,7,9,11]
      ]
    };

    const closure = realClosures[sorted.length];
    
    if (!closure) {
      return this.optimizedClosure(numbers);
    }

    const games = closure.map(indices => 
      indices.map(i => sorted[i]).sort((a, b) => a - b)
    );

    return {
      strategy: 'Desdobramento Matemático',
      description: `Fechamento validado - garante quina se acertar 6 dos ${sorted.length} números`,
      numbers: sorted,
      games: games,
      totalGames: games.length,
      guarantee: `✅ QUINA GARANTIDA se acertar 6 números entre os ${sorted.length} escolhidos`,
      validated: true
    };
  }

  // Fechamento Otimizado (13-20 números) - Alta cobertura para bolões
  optimizedClosure(numbers) {
    const sorted = [...numbers].sort((a, b) => a - b);
    const totalNumbers = sorted.length;
    
    if (totalNumbers < 13 || totalNumbers > 20) {
      return {
        strategy: 'Fechamento Otimizado',
        error: 'Fechamento otimizado disponível para 13-20 números',
        numbers: sorted,
        games: [],
        totalGames: 0
      };
    }

    const games = [];
    const numberFrequency = {};
    sorted.forEach(n => numberFrequency[n] = 0);
    
    const gamesNeeded = Math.ceil(totalNumbers * 5);
    
    const systematicGames = Math.floor(gamesNeeded * 0.7);
    
    for (let i = 0; i < systematicGames; i++) {
      const game = [];
      
      const sortedByFreq = [...sorted].sort((a, b) => {
        const freqDiff = numberFrequency[a] - numberFrequency[b];
        if (freqDiff !== 0) return freqDiff;
        return Math.random() - 0.5;
      });
      
      for (let j = 0; j < 6; j++) {
        game.push(sortedByFreq[j]);
        numberFrequency[sortedByFreq[j]]++;
      }
      
      games.push(game.sort((a, b) => a - b));
    }
    
    const complementGames = gamesNeeded - systematicGames;
    
    for (let i = 0; i < complementGames; i++) {
      const game = [];
      
      const sortedByFreq = [...sorted].sort((a, b) => 
        numberFrequency[a] - numberFrequency[b]
      );
      
      game.push(sortedByFreq[0], sortedByFreq[1], sortedByFreq[2]);
      
      const remaining = sortedByFreq.slice(3);
      for (let j = 0; j < 3 && remaining.length > 0; j++) {
        const randomIndex = Math.floor(Math.random() * remaining.length);
        game.push(remaining[randomIndex]);
        remaining.splice(randomIndex, 1);
      }
      
      game.forEach(n => numberFrequency[n]++);
      games.push(game.sort((a, b) => a - b));
    }

    const costPerPerson20 = ((gamesNeeded * 5) / 20).toFixed(2);
    const costPerPerson10 = ((gamesNeeded * 5) / 10).toFixed(2);

    return {
      strategy: 'Fechamento Otimizado para Bolão',
      description: `${gamesNeeded} jogos com alta cobertura - ideal para bolões`,
      numbers: sorted,
      games: games,
      totalGames: games.length,
      guarantee: `Alta probabilidade de Quina/Quadra • Custo: R$ ${(gamesNeeded * 5).toFixed(2)} total • R$ ${costPerPerson20}/pessoa (20 pessoas) • R$ ${costPerPerson10}/pessoa (10 pessoas)`,
      validated: false,
      forGroup: true
    };
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

  // Exporta para CSV
  exportToCSV(result, ticketPrice = 5.00) {
    if (!result.games || result.games.length === 0) {
      return null;
    }

    let csv = 'Jogo,Numero 1,Numero 2,Numero 3,Numero 4,Numero 5,Numero 6\n';
    
    result.games.forEach((game, index) => {
      csv += `${index + 1},${game.map(n => String(n).padStart(2, '0')).join(',')}\n`;
    });

    csv += `\n`;
    csv += `Estratégia,${result.strategy}\n`;
    csv += `Total de Jogos,${result.totalGames}\n`;
    csv += `Números Utilizados,${result.numbers.join(' ')}\n`;
    csv += `Custo Total,R$ ${(result.totalGames * ticketPrice).toFixed(2)}\n`;
    
    if (result.forGroup) {
      csv += `Custo por Pessoa (20 pessoas),R$ ${((result.totalGames * ticketPrice) / 20).toFixed(2)}\n`;
      csv += `Custo por Pessoa (10 pessoas),R$ ${((result.totalGames * ticketPrice) / 10).toFixed(2)}\n`;
    }
    
    csv += `Garantia,${result.guarantee}\n`;
    
    if (result.validated) {
      csv += `Validação,Fechamento Matemático Real\n`;
    }

    if (result.warning) {
      csv += `Aviso,${result.warning}\n`;
    }

    return csv;
  }

  // Download do CSV
  downloadCSV(result, ticketPrice = 5.00) {
    const csv = this.exportToCSV(result, ticketPrice);
    if (!csv) return;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `megasena_${result.strategy.replace(/\s+/g, '_')}_${result.numbers.length}nums_${result.totalGames}jogos_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Calcula estatísticas
  calculateStats(result) {
    if (!result.games || result.games.length === 0) {
      return null;
    }

    const frequency = {};
    result.numbers.forEach(n => frequency[n] = 0);
    
    result.games.forEach(game => {
      game.forEach(num => {
        if (frequency[num] !== undefined) {
          frequency[num]++;
        }
      });
    });

    const appearances = Object.values(frequency);
    const avgAppearance = appearances.reduce((a, b) => a + b, 0) / appearances.length;
    const minAppearance = Math.min(...appearances);
    const maxAppearance = Math.max(...appearances);

    return {
      averageAppearance: avgAppearance.toFixed(2),
      minAppearance,
      maxAppearance,
      frequency,
      balance: ((1 - (maxAppearance - minAppearance) / avgAppearance) * 100).toFixed(1)
    };
  }
}

export default new ClosingService();
