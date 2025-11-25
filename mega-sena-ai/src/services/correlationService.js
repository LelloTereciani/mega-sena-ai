class CorrelationService {
  
  buildCorrelationMatrix(contests) {
    const cooccurrence = {};
    const frequency = {};
    
    // Inicializa
    for (let i = 1; i <= 60; i++) {
      frequency[i] = 0;
      cooccurrence[i] = {};
      for (let j = 1; j <= 60; j++) {
        cooccurrence[i][j] = 0;
      }
    }
    
    // Conta frequências e co-ocorrências
    contests.forEach(contest => {
      contest.numbers.forEach(num => {
        frequency[num]++;
      });
      
      for (let i = 0; i < contest.numbers.length; i++) {
        for (let j = i + 1; j < contest.numbers.length; j++) {
          const num1 = contest.numbers[i];
          const num2 = contest.numbers[j];
          cooccurrence[num1][num2]++;
          cooccurrence[num2][num1]++;
        }
      }
    });
    
    // Calcula correlação
    const correlation = {};
    const n = contests.length;
    
    for (let i = 1; i <= 60; i++) {
      correlation[i] = {};
      for (let j = 1; j <= 60; j++) {
        if (i === j) {
          correlation[i][j] = 1;
        } else {
          const observed = cooccurrence[i][j];
          const expected = (frequency[i] * frequency[j] * 6) / (n * 60);
          
          if (expected > 0) {
            correlation[i][j] = observed / expected;
          } else {
            correlation[i][j] = 0;
          }
        }
      }
    }
    
    return correlation;
  }
  
  calculateCorrelationScore(correlation) {
    const scores = {};
    
    for (let num = 1; num <= 60; num++) {
      let totalCorrelation = 0;
      let count = 0;
      
      for (let other = 1; other <= 60; other++) {
        if (num !== other) {
          totalCorrelation += correlation[num][other];
          count++;
        }
      }
      
      scores[num] = totalCorrelation / count;
    }
    
    return scores;
  }
  
  generatePrediction(contests, count) {
    const correlation = this.buildCorrelationMatrix(contests);
    const scores = this.calculateCorrelationScore(correlation);
    
    return Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([num]) => parseInt(num));
  }
  
  getMostCorrelated(correlation, number, count = 5) {
    return Object.entries(correlation[number])
      .filter(([num]) => parseInt(num) !== number)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([num, corr]) => ({
        number: parseInt(num),
        correlation: corr.toFixed(3)
      }));
  }
}

export default new CorrelationService();
