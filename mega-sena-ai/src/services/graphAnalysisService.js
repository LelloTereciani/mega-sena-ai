class GraphAnalysisService {
  
  buildCooccurrenceGraph(contests) {
    const graph = {};
    
    for (let i = 1; i <= 60; i++) {
      graph[i] = {};
      for (let j = 1; j <= 60; j++) {
        if (i !== j) graph[i][j] = 0;
      }
    }
    
    contests.forEach(contest => {
      const numbers = contest.numbers;
      for (let i = 0; i < numbers.length; i++) {
        for (let j = i + 1; j < numbers.length; j++) {
          const num1 = numbers[i];
          const num2 = numbers[j];
          graph[num1][num2]++;
          graph[num2][num1]++;
        }
      }
    });
    
    return graph;
  }
  
  calculateDegreeCentrality(graph) {
    const centrality = {};
    
    for (let num = 1; num <= 60; num++) {
      let totalConnections = 0;
      for (let other = 1; other <= 60; other++) {
        if (num !== other) {
          totalConnections += graph[num][other];
        }
      }
      centrality[num] = totalConnections;
    }
    
    return centrality;
  }
  
  getMostConnected(graph, count = 10) {
    const centrality = this.calculateDegreeCentrality(graph);
    
    return Object.entries(centrality)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([num, totalConnections]) => ({
        number: parseInt(num),
        totalConnections,
        strongPairs: this.getStrongPairs(graph, parseInt(num), 3)
      }));
  }
  
  getStrongPairs(graph, number, count = 5) {
    return Object.entries(graph[number])
      .filter(([_, cooccurrences]) => cooccurrences > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([num, cooccurrences]) => ({
        number: parseInt(num),
        cooccurrences
      }));
  }
  
  generatePrediction(graph, count) {
    const centrality = this.calculateDegreeCentrality(graph);
    
    return Object.entries(centrality)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([num]) => parseInt(num));
  }
}

export default new GraphAnalysisService();
