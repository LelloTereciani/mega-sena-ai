import type { Draw } from '../../../drizzle/schema';

/**
 * 1. Regressão Linear - Analisa tendências de frequência ao longo do tempo
 */
export function linearRegression(draws: Draw[]): Map<number, number> {
  const scores = new Map<number, number>();
  
  // Para cada número de 1 a 60
  for (let num = 1; num <= 60; num++) {
    const appearances: number[] = [];
    
    // Encontrar índices onde o número aparece
    draws.forEach((draw, index) => {
      const balls = [draw.ball1, draw.ball2, draw.ball3, draw.ball4, draw.ball5, draw.ball6];
      if (balls.includes(num)) {
        appearances.push(index);
      }
    });
    
    if (appearances.length < 2) {
      scores.set(num, 0);
      continue;
    }
    
    // Calcular tendência (regressão linear simples)
    const n = appearances.length;
    const sumX = appearances.reduce((a, b) => a + b, 0);
    const sumY = Array.from({ length: n }, (_, i) => i + 1).reduce((a, b) => a + b, 0);
    const sumXY = appearances.reduce((sum, x, i) => sum + x * (i + 1), 0);
    const sumX2 = appearances.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    // Slope positivo = tendência crescente (número aparecendo mais recentemente)
    scores.set(num, slope * 100);
  }
  
  return scores;
}

/**
 * 2. Clustering K-means - Agrupa números por padrões de aparição
 */
export function kMeansClustering(draws: Draw[], k: number = 3): Map<number, number> {
  const scores = new Map<number, number>();
  
  // Criar vetor de características para cada número
  const features: number[][] = [];
  
  for (let num = 1; num <= 60; num++) {
    const freq = draws.filter(d => 
      [d.ball1, d.ball2, d.ball3, d.ball4, d.ball5, d.ball6].includes(num)
    ).length;
    
    // Calcular gaps
    let maxGap = 0;
    let currentGap = 0;
    draws.forEach((draw, index) => {
      const balls = [draw.ball1, draw.ball2, draw.ball3, draw.ball4, draw.ball5, draw.ball6];
      if (balls.includes(num)) {
        currentGap = 0;
      } else {
        currentGap++;
        maxGap = Math.max(maxGap, currentGap);
      }
    });
    
    // Vetor de características: [frequência, maxGap]
    features.push([freq, maxGap]);
  }
  
  // Inicializar centroides aleatoriamente
  const centroids: number[][] = [];
  for (let i = 0; i < k; i++) {
    const randomIdx = Math.floor(Math.random() * features.length);
    centroids.push([...features[randomIdx]]);
  }
  
  // K-means iterativo
  let clusters = new Array(60).fill(0);
  const maxIterations = 10;
  
  for (let iter = 0; iter < maxIterations; iter++) {
    // Atribuir pontos ao cluster mais próximo
    let changed = false;
    const dim = features[0].length;
    
    for (let i = 0; i < features.length; i++) {
      let minDist = Infinity;
      let bestCluster = 0;
      
      for (let j = 0; j < k; j++) {
        const dist = euclideanDistance(features[i], centroids[j]);
        if (dist < minDist) {
          minDist = dist;
          bestCluster = j;
        }
      }
      
      if (clusters[i] !== bestCluster) {
        clusters[i] = bestCluster;
        changed = true;
      }
    }
    
    // Atualizar centroides
    for (let j = 0; j < k; j++) {
      const clusterPoints = features.filter((_, i) => clusters[i] === j);
      if (clusterPoints.length > 0) {
        for (let d = 0; d < dim; d++) {
          centroids[j][d] = clusterPoints.reduce((sum, p) => sum + p[d], 0) / clusterPoints.length;
        }
      }
    }
    
    if (!changed) break;
  }
  
  // Converter clusters em scores
  for (let i = 0; i < 60; i++) {
    const cluster = clusters[i];
    // Números no cluster 0 (mais frequentes) recebem maior score
    scores.set(i + 1, (k - cluster) * 10);
  }
  
  return scores;
}

function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
}

/**
 * 3. Rede Neural Simplificada - Predição usando padrões de co-ocorrência
 */
export function neuralNetworkPrediction(draws: Draw[]): Map<number, number> {
  const scores = new Map<number, number>();
  
  // Inicializar scores
  for (let i = 1; i <= 60; i++) {
    scores.set(i, 0);
  }
  
  // Análise de padrões de co-ocorrência (simula rede neural)
  const windowSize = 5; // Últimos 5 sorteios
  
  // Calcular padrões de co-ocorrência
  for (let i = windowSize; i < draws.length; i++) {
    const window: number[] = [];
    
    // Coletar números dos últimos 5 sorteios
    for (let j = i - windowSize; j < i; j++) {
      const draw = draws[j];
      const balls = [draw.ball1, draw.ball2, draw.ball3, draw.ball4, draw.ball5, draw.ball6];
      window.push(...balls);
    }
    
    // Próximo sorteio (label)
    const nextDraw = draws[i];
    const nextBalls = [nextDraw.ball1, nextDraw.ball2, nextDraw.ball3, nextDraw.ball4, nextDraw.ball5, nextDraw.ball6];
    
    // Para cada número no próximo sorteio, aumentar score baseado no padrão
    nextBalls.forEach(ball => {
      // Contar quantas vezes apareceu na janela
      const count = window.filter(n => n === ball).length;
      scores.set(ball, (scores.get(ball) || 0) + count * 0.5);
    });
  }
  
  return scores;
}

/**
 * 4. Regressão Logística - Classificação de números quentes/frios
 */
export function logisticRegression(draws: Draw[]): Map<number, number> {
  const scores = new Map<number, number>();
  const recentWindow = 100; // Últimos 100 sorteios
  
  // Calcular frequência recente vs histórica
  const recentDraws = draws.slice(-recentWindow);
  
  for (let num = 1; num <= 60; num++) {
    const recentFreq = recentDraws.filter(d => 
      [d.ball1, d.ball2, d.ball3, d.ball4, d.ball5, d.ball6].includes(num)
    ).length;
    
    const totalFreq = draws.filter(d => 
      [d.ball1, d.ball2, d.ball3, d.ball4, d.ball5, d.ball6].includes(num)
    ).length;
    
    // Probabilidade logística
    const ratio = recentFreq / (totalFreq || 1);
    const logit = Math.log(ratio / (1 - ratio + 0.001)); // Evitar divisão por zero
    
    scores.set(num, logit * 10);
  }
  
  return scores;
}

/**
 * 5. Ensemble - Combina todas as técnicas
 */
export function ensemblePrediction(draws: Draw[]): Map<number, number> {
  const scores = new Map<number, number>();
  
  // Inicializar
  for (let i = 1; i <= 60; i++) {
    scores.set(i, 0);
  }
  
  // Obter scores de cada técnica
  const linear = linearRegression(draws);
  const clustering = kMeansClustering(draws);
  const neural = neuralNetworkPrediction(draws);
  const logistic = logisticRegression(draws);
  
  // Combinar com pesos iguais
  for (let i = 1; i <= 60; i++) {
    const combined = 
      (linear.get(i) || 0) * 0.25 +
      (clustering.get(i) || 0) * 0.25 +
      (neural.get(i) || 0) * 0.25 +
      (logistic.get(i) || 0) * 0.25;
    
    scores.set(i, combined);
  }
  
  return scores;
}
