import XLSX from 'xlsx';
import { drizzle } from 'drizzle-orm/mysql2';
import { draws } from '../drizzle/schema.ts';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL não encontrada');
  process.exit(1);
}

const db = drizzle(DATABASE_URL);

async function importData() {
  try {
    console.log('Lendo arquivo Excel...');
    const workbook = XLSX.readFile('/home/ubuntu/upload/Mega-Sena.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Total de linhas encontradas: ${data.length}`);

    const drawsToInsert = [];
    let skipped = 0;

    for (const row of data) {
      try {
        // Parse date from DD/MM/YYYY format
        const dateParts = row['Data do Sorteio'].split('/');
        const drawDate = new Date(
          parseInt(dateParts[2]),
          parseInt(dateParts[1]) - 1,
          parseInt(dateParts[0])
        );

        // Extract balls
        const ball1 = parseInt(row['Bola1']);
        const ball2 = parseInt(row['Bola2']);
        const ball3 = parseInt(row['Bola3']);
        const ball4 = parseInt(row['Bola4']);
        const ball5 = parseInt(row['Bola5']);
        const ball6 = parseInt(row['Bola6']);

        // Validate balls
        const balls = [ball1, ball2, ball3, ball4, ball5, ball6];
        if (balls.some(b => isNaN(b) || b < 1 || b > 60)) {
          console.warn(`Sorteio ${row['Concurso']}: bolas inválidas`);
          skipped++;
          continue;
        }

        // Check for duplicates
        if (new Set(balls).size !== 6) {
          console.warn(`Sorteio ${row['Concurso']}: bolas duplicadas`);
          skipped++;
          continue;
        }

        drawsToInsert.push({
          contest: parseInt(row['Concurso']),
          drawDate,
          ball1,
          ball2,
          ball3,
          ball4,
          ball5,
          ball6,
          winners6: parseInt(row['Ganhadores 6 acertos']) || 0,
          prize: 0, // We'll skip prize parsing for now
        });
      } catch (error) {
        console.warn(`Erro ao processar sorteio ${row['Concurso']}: ${error.message}`);
        skipped++;
      }
    }

    console.log(`Sorteios válidos: ${drawsToInsert.length}`);
    console.log(`Sorteios ignorados: ${skipped}`);

    if (drawsToInsert.length > 0) {
      console.log('Inserindo dados no banco...');
      
      // Insert in batches of 100
      const batchSize = 100;
      for (let i = 0; i < drawsToInsert.length; i += batchSize) {
        const batch = drawsToInsert.slice(i, i + batchSize);
        await db.insert(draws).values(batch);
        console.log(`Inseridos ${Math.min(i + batchSize, drawsToInsert.length)} de ${drawsToInsert.length}`);
      }

      console.log('✅ Importação concluída com sucesso!');
    }
  } catch (error) {
    console.error('❌ Erro durante importação:', error);
    process.exit(1);
  }
}

importData();
