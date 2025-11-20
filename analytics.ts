import type { Draw } from '../../../drizzle/schema';

export interface NumberFrequency {
  number: number;
  count: number;
  percentage: number;
  lastSeen: number; // contests ago
}

export interface GapAnalysis {
  number: number;
  currentGap: number;
  averageGap: number;
  maxGap: number;
  isOverdue: boolean;
}

export interface Distribution {
  even: number;
  odd: number;
  low: number; // 1-30
  high: number; // 31-60
  primes: number;
  sum: number;
}

export interface HotColdNumber {
  number: number;
  temperature: 'hot' | 'cold' | 'neutral';
  frequency: number;
  recentAppearances: number; // in last 100 draws
}

export interface Combination {
  numbers: number[];
  count: number;
}

/**
 * Extrai todos os números de um sorteio
 */
export function getDrawNumbers(draw: Draw): number[] {
  return [draw.ball1, draw.ball2, draw.ball3, draw.ball4, draw.ball5, draw.ball6].sort((a, b) => a - b);
}

/**
 * Calcula frequência de cada número
 */
export function calculateFrequency(draws: Draw[]): NumberFrequency[] {
  const frequency = new Map<number, { count: number; lastSeen: number }>();
  
  // Initialize all numbers 1-60
  for (let i = 1; i <= 60; i++) {
    frequency.set(i, { count: 0, lastSeen: draws.length });
  }
  
  // Count occurrences
  draws.forEach((draw, index) => {
    const numbers = getDrawNumbers(draw);
    numbers.forEach(num => {
      const current = frequency.get(num)!;
      current.count++;
      current.lastSeen = Math.min(current.lastSeen, index);
    });
  });
  
  const total = draws.length * 6;
  
  return Array.from(frequency.entries())
    .map(([number, data]) => ({
      number,
      count: data.count,
      percentage: (data.count / total) * 100,
      lastSeen: data.lastSeen,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Analisa gaps (intervalos) entre aparições
 */
export function calculateGaps(draws: Draw[]): GapAnalysis[] {
  const gaps = new Map<number, number[]>();
  const lastSeen = new Map<number, number>();
  
  // Initialize
  for (let i = 1; i <= 60; i++) {
    gaps.set(i, []);
    lastSeen.set(i, -1);
  }
  
  // Calculate gaps
  draws.forEach((draw, index) => {
    const numbers = getDrawNumbers(draw);
    numbers.forEach(num => {
      const last = lastSeen.get(num)!;
      if (last >= 0) {
        gaps.get(num)!.push(index - last);
      }
      lastSeen.set(num, index);
    });
  });
  
  // Calculate statistics
  return Array.from(gaps.entries()).map(([number, gapList]) => {
    const currentGap = draws.length - (lastSeen.get(number) || 0);
    const averageGap = gapList.length > 0 
      ? gapList.reduce((a, b) => a + b, 0) / gapList.length 
      : 0;
    const maxGap = gapList.length > 0 ? Math.max(...gapList) : 0;
    const stdDev = calculateStdDev(gapList);
    const isOverdue = currentGap > averageGap + 2 * stdDev;
    
    return {
      number,
      currentGap,
      averageGap,
      maxGap,
      isOverdue,
    };
  });
}

/**
 * Analisa distribuição de um sorteio
 */
export function analyzeDistribution(numbers: number[]): Distribution {
  const even = numbers.filter(n => n % 2 === 0).length;
  const odd = numbers.length - even;
  const low = numbers.filter(n => n <= 30).length;
  const high = numbers.length - low;
  const primes = numbers.filter(isPrime).length;
  const sum = numbers.reduce((a, b) => a + b, 0);
  
  return { even, odd, low, high, primes, sum };
}

/**
 * Classifica números como quentes, frios ou neutros
 */
export function classifyHotCold(draws: Draw[], recentCount: number = 100): HotColdNumber[] {
  const allFreq = calculateFrequency(draws);
  const recentDraws = draws.slice(0, recentCount);
  const recentFreq = calculateFrequency(recentDraws);
  
  const avgFrequency = allFreq.reduce((sum, f) => sum + f.count, 0) / 60;
  const stdDev = calculateStdDev(allFreq.map(f => f.count));
  
  return allFreq.map(freq => {
    const recent = recentFreq.find(r => r.number === freq.number)!;
    let temperature: 'hot' | 'cold' | 'neutral' = 'neutral';
    
    if (freq.count > avgFrequency + stdDev) {
      temperature = 'hot';
    } else if (freq.count < avgFrequency - stdDev) {
      temperature = 'cold';
    }
    
    return {
      number: freq.number,
      temperature,
      frequency: freq.count,
      recentAppearances: recent.count,
    };
  });
}

/**
 * Encontra duplas mais frequentes
 */
export function findFrequentPairs(draws: Draw[], minCount: number = 10): Combination[] {
  const pairs = new Map<string, number>();
  
  draws.forEach(draw => {
    const numbers = getDrawNumbers(draw);
    for (let i = 0; i < numbers.length; i++) {
      for (let j = i + 1; j < numbers.length; j++) {
        const key = `${numbers[i]}-${numbers[j]}`;
        pairs.set(key, (pairs.get(key) || 0) + 1);
      }
    }
  });
  
  return Array.from(pairs.entries())
    .filter(([_, count]) => count >= minCount)
    .map(([key, count]) => ({
      numbers: key.split('-').map(Number),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}

/**
 * Encontra trios mais frequentes
 */
export function findFrequentTrios(draws: Draw[], minCount: number = 5): Combination[] {
  const trios = new Map<string, number>();
  
  draws.forEach(draw => {
    const numbers = getDrawNumbers(draw);
    for (let i = 0; i < numbers.length; i++) {
      for (let j = i + 1; j < numbers.length; j++) {
        for (let k = j + 1; k < numbers.length; k++) {
          const key = `${numbers[i]}-${numbers[j]}-${numbers[k]}`;
          trios.set(key, (trios.get(key) || 0) + 1);
        }
      }
    }
  });
  
  return Array.from(trios.entries())
    .filter(([_, count]) => count >= minCount)
    .map(([key, count]) => ({
      numbers: key.split('-').map(Number),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}

/**
 * Regressão linear simples para tendências
 */
export function calculateTrend(draws: Draw[], number: number): number {
  const appearances: number[] = [];
  
  draws.forEach((draw, index) => {
    const numbers = getDrawNumbers(draw);
    if (numbers.includes(number)) {
      appearances.push(index);
    }
  });
  
  if (appearances.length < 2) return 0;
  
  // Simple linear regression
  const n = appearances.length;
  const sumX = appearances.reduce((a, b) => a + b, 0);
  const sumY = Array.from({ length: n }, (_, i) => i).reduce((a, b) => a + b, 0);
  const sumXY = appearances.reduce((sum, x, i) => sum + x * i, 0);
  const sumX2 = appearances.reduce((sum, x) => sum + x * x, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  
  return slope; // Positive = increasing frequency, Negative = decreasing
}

// Helper functions

function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Calcula média de distribuição histórica
 */
export function calculateHistoricalDistribution(draws: Draw[]): {
  avgEven: number;
  avgOdd: number;
  avgLow: number;
  avgHigh: number;
  avgPrimes: number;
  avgSum: number;
  stdDevSum: number;
} {
  const distributions = draws.map(draw => analyzeDistribution(getDrawNumbers(draw)));
  
  const avgEven = distributions.reduce((sum, d) => sum + d.even, 0) / draws.length;
  const avgOdd = distributions.reduce((sum, d) => sum + d.odd, 0) / draws.length;
  const avgLow = distributions.reduce((sum, d) => sum + d.low, 0) / draws.length;
  const avgHigh = distributions.reduce((sum, d) => sum + d.high, 0) / draws.length;
  const avgPrimes = distributions.reduce((sum, d) => sum + d.primes, 0) / draws.length;
  const avgSum = distributions.reduce((sum, d) => sum + d.sum, 0) / draws.length;
  const stdDevSum = calculateStdDev(distributions.map(d => d.sum));
  
  return { avgEven, avgOdd, avgLow, avgHigh, avgPrimes, avgSum, stdDevSum };
}
