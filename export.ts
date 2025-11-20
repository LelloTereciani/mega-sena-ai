import Papa from 'papaparse';
import jsPDF from 'jspdf';
import type { Draw } from '../../../drizzle/schema';
import { calculateFrequency, calculateGaps, classifyHotCold, findFrequentPairs, findFrequentTrios, type NumberFrequency } from './analytics';

/**
 * Exporta dados para CSV
 */
export function exportToCSV(data: any[], filename: string) {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exporta tabela de frequência para CSV
 */
export function exportFrequencyToCSV(draws: Draw[], filename: string = 'frequencia-numeros.csv') {
  const frequency = calculateFrequency(draws);
  const data = frequency.map(f => ({
    'Número': f.number.toString().padStart(2, '0'),
    'Frequência': f.count,
    'Percentual': f.percentage.toFixed(2) + '%',
    'Última Aparição': f.lastSeen + ' sorteios atrás',
  }));
  
  exportToCSV(data, filename);
}

/**
 * Exporta análise de gaps para CSV
 */
export function exportGapsToCSV(draws: Draw[], filename: string = 'analise-gaps.csv') {
  const gaps = calculateGaps(draws);
  const data = gaps.map(g => ({
    'Número': g.number.toString().padStart(2, '0'),
    'Gap Atual': g.currentGap,
    'Gap Médio': g.averageGap.toFixed(1),
    'Gap Máximo': g.maxGap,
    'Atrasado': g.isOverdue ? 'Sim' : 'Não',
  }));
  
  exportToCSV(data, filename);
}

/**
 * Exporta números quentes/frios para CSV
 */
export function exportHotColdToCSV(draws: Draw[], filename: string = 'numeros-quentes-frios.csv') {
  const hotCold = classifyHotCold(draws, 100);
  const data = hotCold.map(h => ({
    'Número': h.number.toString().padStart(2, '0'),
    'Temperatura': h.temperature === 'hot' ? 'Quente' : h.temperature === 'cold' ? 'Frio' : 'Neutro',
    'Frequência Total': h.frequency,
    'Aparições Recentes': h.recentAppearances,
  }));
  
  exportToCSV(data, filename);
}

/**
 * Exporta duplas frequentes para CSV
 */
export function exportPairsToCSV(draws: Draw[], filename: string = 'duplas-frequentes.csv') {
  const pairs = findFrequentPairs(draws);
  const data = pairs.map(p => ({
    'Dupla': p.numbers.map(n => n.toString().padStart(2, '0')).join(' - '),
    'Frequência': p.count,
  }));
  
  exportToCSV(data, filename);
}

/**
 * Exporta trios frequentes para CSV
 */
export function exportTriosToCSV(draws: Draw[], filename: string = 'trios-frequentes.csv') {
  const trios = findFrequentTrios(draws);
  const data = trios.map(t => ({
    'Trio': t.numbers.map(n => n.toString().padStart(2, '0')).join(' - '),
    'Frequência': t.count,
  }));
  
  exportToCSV(data, filename);
}

/**
 * Exporta jogos gerados para CSV
 */
export function exportGamesToCSV(games: number[][], filename: string = 'jogos-gerados.csv') {
  const data = games.map((game, index) => ({
    'Jogo': index + 1,
    'Número 1': game[0]?.toString().padStart(2, '0') || '',
    'Número 2': game[1]?.toString().padStart(2, '0') || '',
    'Número 3': game[2]?.toString().padStart(2, '0') || '',
    'Número 4': game[3]?.toString().padStart(2, '0') || '',
    'Número 5': game[4]?.toString().padStart(2, '0') || '',
    'Número 6': game[5]?.toString().padStart(2, '0') || '',
  }));
  
  exportToCSV(data, filename);
}

/**
 * Gera relatório PDF completo
 */
export function generatePDFReport(draws: Draw[], games?: number[][]) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(34, 139, 34); // Verde Caixa
  doc.text('LotoMind AI', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Relatório de Análise de Loterias', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, yPosition);
  doc.text(`Total de Sorteios: ${draws.length}`, pageWidth - 20, yPosition, { align: 'right' });
  
  yPosition += 15;

  // Frequency Analysis
  doc.setFontSize(14);
  doc.setTextColor(34, 139, 34);
  doc.text('1. Análise de Frequência', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  const frequency = calculateFrequency(draws);
  const topNumbers = frequency.slice(0, 10);
  
  doc.text('Top 10 Números Mais Frequentes:', 20, yPosition);
  yPosition += 7;
  
  topNumbers.forEach((f, index) => {
    const text = `${index + 1}. Número ${f.number.toString().padStart(2, '0')}: ${f.count} vezes (${f.percentage.toFixed(2)}%)`;
    doc.text(text, 25, yPosition);
    yPosition += 6;
  });

  yPosition += 10;

  // Hot/Cold Analysis
  doc.setFontSize(14);
  doc.setTextColor(34, 139, 34);
  doc.text('2. Análise de Temperatura', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  const hotCold = classifyHotCold(draws, 100);
  const hotNumbers = hotCold.filter(h => h.temperature === 'hot').slice(0, 10);
  const coldNumbers = hotCold.filter(h => h.temperature === 'cold').slice(0, 10);
  
  doc.text('Números Quentes (últimos 100 sorteios):', 20, yPosition);
  yPosition += 7;
  
  const hotText = hotNumbers.map(h => h.number.toString().padStart(2, '0')).join(', ');
  doc.text(hotText, 25, yPosition);
  yPosition += 10;
  
  doc.text('Números Frios (últimos 100 sorteios):', 20, yPosition);
  yPosition += 7;
  
  const coldText = coldNumbers.map(h => h.number.toString().padStart(2, '0')).join(', ');
  doc.text(coldText, 25, yPosition);
  yPosition += 15;

  // Frequent Pairs
  doc.setFontSize(14);
  doc.setTextColor(34, 139, 34);
  doc.text('3. Duplas Mais Frequentes', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  const pairs = findFrequentPairs(draws, 10).slice(0, 10);
  
  pairs.forEach((p, index) => {
    const text = `${index + 1}. ${p.numbers.map(n => n.toString().padStart(2, '0')).join(' - ')}: ${p.count} vezes`;
    doc.text(text, 25, yPosition);
    yPosition += 6;
    
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
    }
  });

  // Generated Games (if provided)
  if (games && games.length > 0) {
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    } else {
      yPosition += 15;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(34, 139, 34);
    doc.text('4. Jogos Gerados', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    games.forEach((game, index) => {
      const text = `Jogo ${index + 1}: ${game.map(n => n.toString().padStart(2, '0')).join(' - ')}`;
      doc.text(text, 25, yPosition);
      yPosition += 6;
      
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }
    });
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Custo Total: R$ ${(games.length * 5.0).toFixed(2)}`, 25, yPosition);
  }

  // Footer
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('LotoMind AI - Análise Inteligente de Loterias', pageWidth / 2, footerY, { align: 'center' });
  doc.text('Ferramenta educacional. Não garantimos resultados.', pageWidth / 2, footerY + 5, { align: 'center' });

  // Save
  doc.save('relatorio-lotomind.pdf');
}
