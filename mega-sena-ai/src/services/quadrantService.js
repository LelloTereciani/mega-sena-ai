class QuadrantService {
  
  // Define os quadrantes
  getQuadrants() {
    return {
      Q1: { range: [1, 15], label: 'Quadrante 1 (01-15)', numbers: this.generateRange(1, 15) },
      Q2: { range: [16, 30], label: 'Quadrante 2 (16-30)', numbers: this.generateRange(16, 30) },
      Q3: { range: [31, 45], label: 'Quadrante 3 (31-45)', numbers: this.generateRange(31, 45) },
      Q4: { range: [46, 60], label: 'Quadrante 4 (46-60)', numbers: this.generateRange(46, 60) }
    };
  }

  // Gera range de números
  generateRange(start, end) {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  // Obtém números disponíveis após suprimir quadrantes
  getAvailableNumbers(suppressedQuadrants = []) {
    const quadrants = this.getQuadrants();
    let availableNumbers = [];

    Object.keys(quadrants).forEach(key => {
      if (!suppressedQuadrants.includes(key)) {
        availableNumbers = availableNumbers.concat(quadrants[key].numbers);
      }
    });

    return availableNumbers.sort((a, b) => a - b);
  }

  // Analisa quadrantes nos sorteios históricos
  analyzeQuadrants(contests) {
    const quadrants = this.getQuadrants();
    const stats = {
      Q1: { count: 0, percentage: 0 },
      Q2: { count: 0, percentage: 0 },
      Q3: { count: 0, percentage: 0 },
      Q4: { count: 0, percentage: 0 }
    };

    let totalNumbers = 0;

    contests.forEach(contest => {
      contest.numbers.forEach(num => {
        totalNumbers++;
        if (num >= 1 && num <= 15) stats.Q1.count++;
        else if (num >= 16 && num <= 30) stats.Q2.count++;
        else if (num >= 31 && num <= 45) stats.Q3.count++;
        else if (num >= 46 && num <= 60) stats.Q4.count++;
      });
    });

    // Calcula percentuais
    Object.keys(stats).forEach(key => {
      stats[key].percentage = ((stats[key].count / totalNumbers) * 100).toFixed(2);
    });

    return stats;
  }

  // Analisa distribuição de quadrantes por sorteio
  getQuadrantDistribution(contests) {
    const distributions = {};

    contests.forEach(contest => {
      const quadrantCount = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };

      contest.numbers.forEach(num => {
        if (num >= 1 && num <= 15) quadrantCount.Q1++;
        else if (num >= 16 && num <= 30) quadrantCount.Q2++;
        else if (num >= 31 && num <= 45) quadrantCount.Q3++;
        else if (num >= 46 && num <= 60) quadrantCount.Q4++;
      });

      const pattern = `${quadrantCount.Q1}-${quadrantCount.Q2}-${quadrantCount.Q3}-${quadrantCount.Q4}`;
      distributions[pattern] = (distributions[pattern] || 0) + 1;
    });

    return Object.entries(distributions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([pattern, count]) => ({
        pattern,
        count,
        percentage: ((count / contests.length) * 100).toFixed(2)
      }));
  }

  // Identifica quadrantes "quentes" e "frios"
  getHotColdQuadrants(contests, recentCount = 50) {
    const recent = contests.slice(-recentCount);
    const recentStats = this.analyzeQuadrants(recent);
    const allStats = this.analyzeQuadrants(contests);

    const analysis = {};

    Object.keys(recentStats).forEach(key => {
      const recentPerc = parseFloat(recentStats[key].percentage);
      const allPerc = parseFloat(allStats[key].percentage);
      const diff = recentPerc - allPerc;

      analysis[key] = {
        recent: recentPerc,
        historical: allPerc,
        difference: diff.toFixed(2),
        status: diff > 2 ? 'hot' : diff < -2 ? 'cold' : 'normal'
      };
    });

    return analysis;
  }

  // Gera sugestão de quadrantes a suprimir baseado em análise
  suggestSuppression(contests) {
    const hotCold = this.getHotColdQuadrants(contests);
    const suggestions = [];

    Object.entries(hotCold).forEach(([quadrant, data]) => {
      if (data.status === 'cold') {
        suggestions.push({
          quadrant,
          reason: `${data.difference}% abaixo da média histórica`,
          confidence: Math.abs(parseFloat(data.difference))
        });
      }
    });

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  // Valida se há números suficientes após supressão
  validateSuppression(suppressedQuadrants, minNumbers = 10) {
    const available = this.getAvailableNumbers(suppressedQuadrants);
    
    if (available.length < minNumbers) {
      return {
        valid: false,
        message: `Mínimo de ${minNumbers} números necessários. Restam apenas ${available.length}.`,
        availableCount: available.length
      };
    }

    if (available.length < 6) {
      return {
        valid: false,
        message: 'Impossível gerar jogos de 6 números com menos de 6 disponíveis.',
        availableCount: available.length
      };
    }

    return {
      valid: true,
      message: `${available.length} números disponíveis para geração.`,
      availableCount: available.length
    };
  }
}

export default new QuadrantService();
