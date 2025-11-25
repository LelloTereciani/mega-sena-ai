class AnalyticsService {
  
  // Calcula frequência de cada número
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

  // Números mais sorteados
  getHotNumbers(contests, count = 10) {
    const frequency = this.calculateFrequency(contests);
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([num, freq]) => ({ 
        number: parseInt(num), 
        frequency: freq,
        percentage: ((freq / contests.length) * 100).toFixed(2)
      }));
  }

  // Números menos sorteados
  getColdNumbers(contests, count = 10) {
    const frequency = this.calculateFrequency(contests);
    return Object.entries(frequency)
      .sort((a, b) => a[1] - b[1])
      .slice(0, count)
      .map(([num, freq]) => ({ 
        number: parseInt(num), 
        frequency: freq,
        percentage: ((freq / contests.length) * 100).toFixed(2)
      }));
  }

  // Duplas mais sorteadas
  getTopPairs(contests, count = 10) {
    const pairs = {};
    
    contests.forEach(contest => {
      const numbers = [...contest.numbers].sort((a, b) => a - b);
      
      for (let i = 0; i < numbers.length; i++) {
        for (let j = i + 1; j < numbers.length; j++) {
          const key = `${numbers[i]}-${numbers[j]}`;
          pairs[key] = (pairs[key] || 0) + 1;
        }
      }
    });

    return Object.entries(pairs)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([pair, freq]) => {
        const [n1, n2] = pair.split('-').map(Number);
        return {
          numbers: [n1, n2],
          frequency: freq,
          percentage: ((freq / contests.length) * 100).toFixed(2)
        };
      });
  }

  // Duplas menos sorteadas (FILTRADO: apenas > 1)
  getLeastPairs(contests, count = 10) {
    const pairs = {};
    
    contests.forEach(contest => {
      const numbers = [...contest.numbers].sort((a, b) => a - b);
      
      for (let i = 0; i < numbers.length; i++) {
        for (let j = i + 1; j < numbers.length; j++) {
          const key = `${numbers[i]}-${numbers[j]}`;
          pairs[key] = (pairs[key] || 0) + 1;
        }
      }
    });

    // Filtra apenas duplas que apareceram MAIS de 1 vez
    const validPairs = Object.entries(pairs)
      .filter(([_, freq]) => freq > 1)
      .map(([pair, freq]) => {
        const [n1, n2] = pair.split('-').map(Number);
        return {
          numbers: [n1, n2],
          frequency: freq,
          percentage: ((freq / contests.length) * 100).toFixed(2)
        };
      })
      .sort((a, b) => a.frequency - b.frequency)
      .slice(0, count);

    return validPairs;
  }

  // Trios mais sorteados
  getTopTrios(contests, count = 10) {
    const trios = {};
    
    contests.forEach(contest => {
      const numbers = [...contest.numbers].sort((a, b) => a - b);
      
      for (let i = 0; i < numbers.length; i++) {
        for (let j = i + 1; j < numbers.length; j++) {
          for (let k = j + 1; k < numbers.length; k++) {
            const key = `${numbers[i]}-${numbers[j]}-${numbers[k]}`;
            trios[key] = (trios[key] || 0) + 1;
          }
        }
      }
    });

    return Object.entries(trios)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([trio, freq]) => {
        const [n1, n2, n3] = trio.split('-').map(Number);
        return {
          numbers: [n1, n2, n3],
          frequency: freq,
          percentage: ((freq / contests.length) * 100).toFixed(2)
        };
      });
  }

  // Trios menos sorteados (FILTRADO: apenas > 1)
  getLeastTrios(contests, count = 10) {
    const trios = {};
    
    contests.forEach(contest => {
      const numbers = [...contest.numbers].sort((a, b) => a - b);
      
      for (let i = 0; i < numbers.length; i++) {
        for (let j = i + 1; j < numbers.length; j++) {
          for (let k = j + 1; k < numbers.length; k++) {
            const key = `${numbers[i]}-${numbers[j]}-${numbers[k]}`;
            trios[key] = (trios[key] || 0) + 1;
          }
        }
      }
    });

    // Filtra apenas trios que apareceram MAIS de 1 vez
    const validTrios = Object.entries(trios)
      .filter(([_, freq]) => freq > 1)
      .map(([trio, freq]) => {
        const [n1, n2, n3] = trio.split('-').map(Number);
        return {
          numbers: [n1, n2, n3],
          frequency: freq,
          percentage: ((freq / contests.length) * 100).toFixed(2)
        };
      })
      .sort((a, b) => a.frequency - b.frequency)
      .slice(0, count);

    return validTrios;
  }

  // Análise de pares e ímpares
  getEvenOddAnalysis(contests) {
    let evenCount = 0;
    let oddCount = 0;

    contests.forEach(contest => {
      contest.numbers.forEach(num => {
        if (num % 2 === 0) evenCount++;
        else oddCount++;
      });
    });

    return {
      even: evenCount,
      odd: oddCount,
      evenPercentage: ((evenCount / (evenCount + oddCount)) * 100).toFixed(1),
      oddPercentage: ((oddCount / (evenCount + oddCount)) * 100).toFixed(1)
    };
  }

  // Últimos N sorteios
  getRecentDraws(contests, count = 10) {
    return contests.slice(-count).reverse();
  }

  // Números atrasados com análise estatística
  getDelayedNumbers(contests, count = 20) {
    const lastAppearance = {};
    const frequency = {};
    
    for (let i = 1; i <= 60; i++) {
      lastAppearance[i] = -1;
      frequency[i] = 0;
    }

    contests.forEach((contest, index) => {
      contest.numbers.forEach(num => {
        lastAppearance[num] = index;
        frequency[num]++;
      });
    });

    const totalContests = contests.length;
    const lastIndex = totalContests - 1;
    const expectedFrequency = (totalContests * 6) / 60;
    
    const results = Object.entries(lastAppearance)
      .map(([num, lastIdx]) => {
        const numFreq = frequency[num];
        
        let drawsSinceLastAppearance;
        if (lastIdx === -1) {
          drawsSinceLastAppearance = totalContests;
        } else {
          drawsSinceLastAppearance = lastIndex - lastIdx;
        }
        
        const deficit = expectedFrequency - numFreq;
        
        let delayScore;
        if (numFreq === 0) {
          delayScore = totalContests * 2;
        } else {
          const deficitFactor = Math.max(0, deficit / expectedFrequency);
          delayScore = drawsSinceLastAppearance * (1 + deficitFactor);
        }
        
        return {
          number: parseInt(num),
          drawsAgo: drawsSinceLastAppearance,
          frequency: numFreq,
          expectedFrequency: parseFloat(expectedFrequency.toFixed(2)),
          deficit: parseFloat(deficit.toFixed(2)),
          delayScore: parseFloat(delayScore.toFixed(2)),
          lastContestNumber: lastIdx >= 0 ? contests[lastIdx]?.contestNumber : null
        };
      })
      .sort((a, b) => b.delayScore - a.delayScore)
      .slice(0, count);
    
    return results;
  }

  // Soma dos números
  getSumAnalysis(contests) {
    const sums = contests.map(contest => 
      contest.numbers.reduce((acc, num) => acc + num, 0)
    );

    const average = sums.reduce((acc, sum) => acc + sum, 0) / sums.length;
    const min = Math.min(...sums);
    const max = Math.max(...sums);

    return {
      average: Math.round(average),
      min,
      max,
      median: this.calculateMedian(sums)
    };
  }

  // Análise por dezenas (1-10, 11-20, etc)
  getDecadeAnalysis(contests) {
    const decades = {
      '01-10': 0,
      '11-20': 0,
      '21-30': 0,
      '31-40': 0,
      '41-50': 0,
      '51-60': 0
    };

    contests.forEach(contest => {
      contest.numbers.forEach(num => {
        if (num <= 10) decades['01-10']++;
        else if (num <= 20) decades['11-20']++;
        else if (num <= 30) decades['21-30']++;
        else if (num <= 40) decades['31-40']++;
        else if (num <= 50) decades['41-50']++;
        else decades['51-60']++;
      });
    });

    const total = Object.values(decades).reduce((a, b) => a + b, 0);

    return Object.entries(decades).map(([range, count]) => ({
      range,
      count,
      percentage: ((count / total) * 100).toFixed(2)
    }));
  }

  calculateMedian(arr) {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
      : sorted[mid];
  }
}

export default new AnalyticsService();
