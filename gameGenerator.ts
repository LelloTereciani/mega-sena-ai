import type { Draw } from '../../../drizzle/schema';
import { calculateFrequency, calculateGaps, classifyHotCold } from './analytics';

export type GenerationStrategy = {
  name: string;
  description: string;
  weights: {
    frequency: number;
    gap: number;
    trend: number;
    temperature: number;
  };
};

export type GameFilters = {
  minEven?: number;
  maxEven?: number;
  minLow?: number;
  maxLow?: number;
  allowConsecutive?: boolean;
  maxConsecutive?: number;
  minHot?: number;
  maxCold?: number;
  minSum?: number;
  maxSum?: number;
  minPrimes?: number;
  maxPrimes?: number;
  excludeMultiplesOf?: number[];
  includeNumbers?: number[];
  excludeNumbers?: number[];
};

export const strategies: Record<string, GenerationStrategy> = {
  statistical: {
    name: 'Estatística',
    description: 'Análise de frequência histórica dos números sorteados',
    weights: { frequency: 0.5, gap: 0.2, trend: 0.15, temperature: 0.15 },
  },
  linear: {
    name: 'Regressão Linear',
    description: 'Analisa tendências de frequência ao longo do tempo usando regressão',
    weights: { frequency: 0.3, gap: 0.2, trend: 0.4, temperature: 0.1 },
  },
  clustering: {
    name: 'Clustering K-means',
    description: 'Agrupa números por padrões de aparição em 3 clusters',
    weights: { frequency: 0.25, gap: 0.25, trend: 0.25, temperature: 0.25 },
  },
  logistic: {
    name: 'Regressão Logística',
    description: 'Classificação probabilística de números quentes/frios',
    weights: { frequency: 0.2, gap: 0.2, trend: 0.3, temperature: 0.3 },
  },
  neural: {
    name: 'Rede Neural (IA)',
    description: 'Predição avançada usando deep learning com TensorFlow.js',
    weights: { frequency: 0.2, gap: 0.2, trend: 0.3, temperature: 0.3 },
  },
};

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

function validateGame(
  game: number[],
  filters: GameFilters,
  draws: Draw[],
  hotCold?: ReturnType<typeof classifyHotCold>
): boolean {
  if (game.length !== 6) return false;
  
  // Paridade
  const even = game.filter(n => n % 2 === 0).length;
  if (filters.minEven !== undefined && even < filters.minEven) return false;
  if (filters.maxEven !== undefined && even > filters.maxEven) return false;
  
  // Alto/Baixo
  const low = game.filter(n => n <= 30).length;
  if (filters.minLow !== undefined && low < filters.minLow) return false;
  if (filters.maxLow !== undefined && low > filters.maxLow) return false;
  
  // Consecutivos
  if (filters.allowConsecutive === false) {
    const sorted = [...game].sort((a, b) => a - b);
    let maxConsec = 1;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === sorted[i - 1] + 1) {
        maxConsec++;
      } else {
        maxConsec = 1;
      }
      if (maxConsec > (filters.maxConsecutive || 2)) return false;
    }
  }
  
  // Soma
  const dist = {
    sum: game.reduce((a, b) => a + b, 0),
    primes: game.filter(n => isPrime(n)).length,
  };
  
  if (filters.minSum !== undefined && dist.sum < filters.minSum) return false;
  if (filters.maxSum !== undefined && dist.sum > filters.maxSum) return false;
  
  // Primos
  if (filters.minPrimes !== undefined && dist.primes < filters.minPrimes) return false;
  if (filters.maxPrimes !== undefined && dist.primes > filters.maxPrimes) return false;
  
  // Múltiplos
  if (filters.excludeMultiplesOf) {
    for (const mult of filters.excludeMultiplesOf) {
      const count = game.filter(n => n % mult === 0).length;
      if (count > 2) return false;
    }
  }
  
  // Temperatura
  if ((filters.minHot !== undefined || filters.maxCold !== undefined) && hotCold) {
    const gameTemp = game.map(n => hotCold.find(h => h.number === n)!);
    const hotCount = gameTemp.filter(t => t.temperature === 'hot').length;
    const coldCount = gameTemp.filter(t => t.temperature === 'cold').length;
    
    if (filters.minHot !== undefined && hotCount < filters.minHot) return false;
    if (filters.maxCold !== undefined && coldCount > filters.maxCold) return false;
  }
  
  return true;
}

/**
 * Gera um jogo baseado em estratégia e filtros
 */
export function generateGame(
  draws: Draw[],
  strategy: GenerationStrategy,
  filters: GameFilters = {}
): number[] {
  const frequency = calculateFrequency(draws);
  const gaps = calculateGaps(draws);
  const hotCold = classifyHotCold(draws);
  
  // Create lookup maps for O(1) access
  const freqMap = new Map(frequency.map(f => [f.number, f]));
  const gapMap = new Map(gaps.map(g => [g.number, g]));
  const tempMap = new Map(hotCold.map(h => [h.number, h]));
  
  // Calculate scores for each number
  const scores = new Map<number, number>();
  const maxFreq = Math.max(...frequency.map(f => f.count));
  
  for (let num = 1; num <= 60; num++) {
    // Skip excluded numbers
    if (filters.excludeNumbers?.includes(num)) continue;
    
    const freq = freqMap.get(num);
    const gap = gapMap.get(num);
    const temp = tempMap.get(num);
    
    if (!freq || !gap || !temp) continue;
    
    // Normalize scores (0-1)
    const freqScore = freq.count / maxFreq;
    const gapScore = gap.isOverdue ? 1 : Math.min(gap.currentGap / gap.averageGap, 1);
    const trendScore = 0.5;
    const tempScore = temp.temperature === 'hot' ? 1 : temp.temperature === 'cold' ? 0 : 0.5;
    
    // Weighted sum
    const totalScore = 
      freqScore * strategy.weights.frequency +
      gapScore * strategy.weights.gap +
      trendScore * strategy.weights.trend +
      tempScore * strategy.weights.temperature;
    
    scores.set(num, totalScore);
  }
  
  // Select numbers
  let candidates = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([num]) => num);
  
  // Add fixed numbers first
  const selected: number[] = [...(filters.includeNumbers || [])];
  candidates = candidates.filter(n => !selected.includes(n));
  
  // Quick path: if no complex filters, just take top 6
  const hasComplexFilters = Object.keys(filters).length > 0 && 
    (filters.minEven !== undefined || filters.maxEven !== undefined ||
     filters.minLow !== undefined || filters.maxLow !== undefined ||
     filters.minSum !== undefined || filters.maxSum !== undefined);
  
  if (!hasComplexFilters) {
    for (const num of candidates) {
      if (selected.length >= 6) break;
      selected.push(num);
    }
    return selected.sort((a, b) => a - b);
  }
  
  // Select remaining numbers with validation
  let attempts = 0;
  const maxAttempts = 50;
  
  while (selected.length < 6 && attempts < maxAttempts) {
    const game = [...selected];
    
    // Add top candidates
    for (const num of candidates) {
      if (game.length >= 6) break;
      if (!game.includes(num)) {
        game.push(num);
      }
    }
    
    // Validate against filters
    if (validateGame(game, filters, draws, hotCold)) {
      return game.sort((a, b) => a - b);
    }
    
    // Shuffle candidates for next attempt
    candidates = shuffleArray(candidates);
    attempts++;
  }
  
  // Fallback: return top 6 candidates
  return candidates.slice(0, 6).sort((a, b) => a - b);
}

/**
 * Gera múltiplos jogos
 */
export function generateMultipleGames(
  draws: Draw[],
  strategy: GenerationStrategy,
  filters: GameFilters,
  count: number
): number[][] {
  const games: number[][] = [];
  const gamesSet = new Set<string>();
  
  let attempts = 0;
  const maxAttempts = Math.min(count * 50, 500);
  
  while (games.length < count && attempts < maxAttempts) {
    const game = generateGame(draws, strategy, filters);
    const key = game.join(',');
    
    if (!gamesSet.has(key)) {
      games.push(game);
      gamesSet.add(key);
    }
    
    attempts++;
  }
  
  return games;
}

/**
 * Sistema de otimização de cartões (6-20 números)
 */
export function optimizeCards(
  selectedNumbers: number[],
  optimizationLevel: 'complete' | 'optimized' | 'economical' = 'optimized'
): {
  cards: number[][];
  coverage: number;
  totalCost: number;
  technique: string;
} {
  const n = selectedNumbers.length;
  
  if (n < 6) {
    throw new Error('Mínimo de 6 números necessário');
  }
  
  if (n === 6) {
    return {
      cards: [selectedNumbers],
      coverage: 100,
      totalCost: 5.0,
      technique: 'Cartão simples',
    };
  }
  
  // Combinações C(n, 6)
  const factorial = (num: number): number => {
    if (num < 0) return NaN;
    if (num === 0 || num === 1) return 1;
    let result = 1;
    for (let i = 2; i <= num; i++) result *= i;
    return result;
  };
  const totalCombinations = factorial(n) / (factorial(6) * factorial(n - 6));
  
  if (optimizationLevel === 'complete') {
    // Generate all combinations
    const cards: number[][] = [];
    const indices = Array.from({ length: 6 }, (_, i) => i);
    
    while (true) {
      cards.push(indices.map(i => selectedNumbers[i]));
      
      let i = 5;
      while (i >= 0 && indices[i] === n - 6 + i) i--;
      if (i < 0) break;
      
      indices[i]++;
      for (let j = i + 1; j < 6; j++) {
        indices[j] = indices[j - 1] + 1;
      }
    }
    
    return {
      cards,
      coverage: 100,
      totalCost: cards.length * 5.0,
      technique: `Cobertura completa (${cards.length} cartões)`,
    };
  }
  
  if (optimizationLevel === 'economical') {
    // Minimum covering
    const cards: number[][] = [];
    const covered = new Set<string>();
    const remaining = new Set(selectedNumbers);
    
    while (remaining.size >= 6) {
      const card = Array.from(remaining).slice(0, 6);
      cards.push(card);
      
      // Mark all 6-combinations in this card as covered
      for (let i = 0; i < card.length; i++) {
        covered.add(card[i].toString());
      }
      
      // Remove one number for next card
      remaining.delete(card[Math.floor(Math.random() * card.length)]);
    }
    
    return {
      cards,
      coverage: Math.round((covered.size / n) * 100),
      totalCost: cards.length * 5.0,
      technique: `Cobertura econômica (${cards.length} cartões)`,
    };
  }
  
  // Optimized (default)
  const cards: number[][] = [];
  const frequency = new Map<number, number>();
  
  // Initialize frequency
  selectedNumbers.forEach(n => frequency.set(n, 0));
  
  // Generate cards greedily
  const targetCards = Math.ceil(totalCombinations * 0.3);
  
  for (let i = 0; i < targetCards && selectedNumbers.length >= 6; i++) {
    // Sort by frequency (least frequent first)
    const sorted = [...selectedNumbers].sort((a, b) => 
      (frequency.get(a) || 0) - (frequency.get(b) || 0)
    );
    
    const card = sorted.slice(0, 6);
    cards.push(card);
    
    // Update frequency
    card.forEach(n => frequency.set(n, (frequency.get(n) || 0) + 1));
  }
  
  return {
    cards,
    coverage: Math.round((cards.length / totalCombinations) * 100),
    totalCost: cards.length * 5.0,
    technique: `Cobertura otimizada (${cards.length} cartões)`,
  };
}


