class CycleAnalysisService {
  
  analyzeCycles(contests) {
    const cycles = {};
    
    for (let num = 1; num <= 60; num++) {
      const appearances = this.getAppearances(contests, num);
      const intervals = this.calculateIntervals(appearances);
      
      if (intervals.length > 0) {
        const avgInterval = this.mean(intervals);
        const stdInterval = this.std(intervals);
        const lastAppearance = appearances[appearances.length - 1];
        const lastDrawIndex = contests.length - 1;
        const timeSinceLastAppearance = lastDrawIndex - lastAppearance;
        
        cycles[num] = {
          avgInterval: parseFloat(avgInterval.toFixed(2)),
          stdInterval: parseFloat(stdInterval.toFixed(2)),
          lastAppearance,
          timeSinceLast: timeSinceLastAppearance,
          predictedNext: lastAppearance + Math.round(avgInterval),
          probability: this.calculateProbability(timeSinceLastAppearance, avgInterval, stdInterval),
          status: this.getStatus(timeSinceLastAppearance, avgInterval)
        };
      }
    }
    
    return cycles;
  }
  
  getAppearances(contests, number) {
    const appearances = [];
    contests.forEach((contest, index) => {
      if (contest.numbers.includes(number)) {
        appearances.push(index);
      }
    });
    return appearances;
  }
  
  calculateIntervals(appearances) {
    const intervals = [];
    for (let i = 1; i < appearances.length; i++) {
      intervals.push(appearances[i] - appearances[i-1]);
    }
    return intervals;
  }
  
  calculateProbability(timeSince, avgInterval, stdInterval) {
    if (stdInterval === 0) return 50;
    
    const zScore = (timeSince - avgInterval) / stdInterval;
    
    if (zScore < -2) return 10;
    if (zScore > 2) return 90;
    
    return Math.round(50 + (zScore / 4) * 40);
  }
  
  getStatus(timeSince, avgInterval) {
    const ratio = timeSince / avgInterval;
    if (ratio > 1.5) return 'MUITO ATRASADO';
    if (ratio > 1.2) return 'ATRASADO';
    if (ratio < 0.5) return 'MUITO CEDO';
    if (ratio < 0.8) return 'CEDO';
    return 'NO PRAZO';
  }
  
  mean(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }
  
  std(arr) {
    const avg = this.mean(arr);
    const squareDiffs = arr.map(value => Math.pow(value - avg, 2));
    return Math.sqrt(this.mean(squareDiffs));
  }
  
  getMostProbable(cycles, count = 10) {
    return Object.entries(cycles)
      .sort((a, b) => b[1].probability - a[1].probability)
      .slice(0, count)
      .map(([num, data]) => ({
        number: parseInt(num),
        probability: data.probability,
        status: data.status,
        timeSinceLast: data.timeSinceLast,
        avgInterval: data.avgInterval
      }));
  }
}

export default new CycleAnalysisService();
