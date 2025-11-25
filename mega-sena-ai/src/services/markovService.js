class MarkovService {
  
  buildTransitionMatrix(contests) {
    const matrix = {};
    
    for (let i = 1; i <= 60; i++) {
      matrix[i] = {};
      for (let j = 1; j <= 60; j++) {
        matrix[i][j] = 0;
      }
    }
    
    for (let i = 0; i < contests.length - 1; i++) {
      const current = contests[i].numbers;
      const next = contests[i + 1].numbers;
      
      for (const c of current) {
        for (const n of next) {
          matrix[c][n]++;
        }
      }
    }
    
    // Normaliza para probabilidades
    for (let i = 1; i <= 60; i++) {
      const total = Object.values(matrix[i]).reduce((a, b) => a + b, 0);
      if (total > 0) {
        for (let j = 1; j <= 60; j++) {
          matrix[i][j] = matrix[i][j] / total;
        }
      }
    }
    
    return matrix;
  }
  
  predictNext(matrix, lastDraw, count) {
    const scores = {};
    
    for (let num = 1; num <= 60; num++) {
      scores[num] = 0;
    }
    
    // Para cada número do último sorteio, soma probabilidades
    lastDraw.forEach(num => {
      for (let next = 1; next <= 60; next++) {
        scores[next] += matrix[num][next];
      }
    });
    
    return Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([num, prob]) => ({
        number: parseInt(num),
        probability: (prob * 100).toFixed(2)
      }));
  }
  
  generatePrediction(contests, count) {
    const matrix = this.buildTransitionMatrix(contests);
    const lastDraw = contests[contests.length - 1].numbers;
    const prediction = this.predictNext(matrix, lastDraw, count);
    
    return prediction.map(p => p.number);
  }
}

export default new MarkovService();
