const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.post('/api/process-excel', upload.single('file'), (req, res) => {
  console.log('\n📊 ========== NOVO UPLOAD ==========');
  console.log('📂 Arquivo:', req.file.originalname);
  console.log('📍 Caminho:', req.file.path);
  console.log('📏 Tamanho:', req.file.size, 'bytes');
  
  const filePath = req.file.path;
  const pythonScript = path.join(__dirname, 'converter-excel.py');
  
  // ADICIONA ASPAS para lidar com espaços no caminho!
  const command = `python3 "${pythonScript}" "${filePath}"`;
  
  console.log('🐍 Executando comando:', command);
  
  exec(command, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
    console.log('\n--- STDOUT do Python ---');
    console.log(stdout);
    
    if (stderr) {
      console.log('\n--- STDERR do Python ---');
      console.log(stderr);
    }
    
    if (error) {
      console.error('\n❌ ERRO ao executar Python:');
      console.error('Código:', error.code);
      console.error('Mensagem:', error.message);
      
      fs.unlinkSync(filePath);
      
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao processar Excel com Python',
        details: stderr || error.message,
        stdout: stdout
      });
    }
    
    const jsonPath = path.join(__dirname, 'mega-sena-dados.json');
    console.log('\n📂 Procurando JSON:', jsonPath);
    console.log('📂 Existe?', fs.existsSync(jsonPath));
    
    if (!fs.existsSync(jsonPath)) {
      fs.unlinkSync(filePath);
      return res.status(500).json({ 
        success: false, 
        error: 'Python não gerou o arquivo JSON',
        stdout: stdout,
        stderr: stderr
      });
    }
    
    try {
      const dados = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
      console.log(`✅ ${dados.length} concursos processados!`);
      console.log('📋 Primeiros 3 concursos:');
      console.log(JSON.stringify(dados.slice(0, 3), null, 2));
      
      fs.unlinkSync(filePath);
      
      res.json({ 
        success: true, 
        count: dados.length,
        contests: dados 
      });
      
    } catch (err) {
      console.error('❌ Erro ao ler JSON:', err);
      fs.unlinkSync(filePath);
      
      res.status(500).json({ 
        success: false, 
        error: 'Erro ao processar JSON gerado pelo Python',
        details: err.message
      });
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor rodando!',
    python: 'Disponível'
  });
});

app.listen(PORT, () => {
  console.log('\n🚀 ========================================');
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📊 Endpoint: POST /api/process-excel`);
  console.log(`🐍 Python: Pronto para processar Excel`);
  console.log('🚀 ========================================\n');
});
