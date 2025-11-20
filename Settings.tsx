import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings as SettingsIcon, Save, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import * as XLSX from 'xlsx';

interface AppSettings {
  ticketPrice: number;
  defaultPeriod: number;
  defaultStrategy: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  ticketPrice: 5.0,
  defaultPeriod: 100,
  defaultStrategy: 'statistical',
};

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const importDrawsMutation = trpc.draws.import.useMutation();

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('lotomind-settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    }
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('lotomind-settings', JSON.stringify(settings));
    toast.success('Configurações salvas!', {
      description: 'Suas preferências foram atualizadas.',
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportProgress(0);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      setImportProgress(30);

      // Validar estrutura
      if (jsonData.length === 0) {
        throw new Error('Arquivo vazio');
      }

      const firstRow: any = jsonData[0];
      const requiredFields = ['Concurso', 'Data Sorteio', 'Bola1', 'Bola2', 'Bola3', 'Bola4', 'Bola5', 'Bola6'];
      
      for (const field of requiredFields) {
        if (!(field in firstRow)) {
          throw new Error(`Campo obrigatório ausente: ${field}`);
        }
      }

      setImportProgress(50);

      // Processar dados
      const draws = jsonData.map((row: any) => ({
        contest: parseInt(row['Concurso']),
        drawDate: new Date(row['Data Sorteio']),
        ball1: parseInt(row['Bola1']),
        ball2: parseInt(row['Bola2']),
        ball3: parseInt(row['Bola3']),
        ball4: parseInt(row['Bola4']),
        ball5: parseInt(row['Bola5']),
        ball6: parseInt(row['Bola6']),
        winners6: parseInt(row['Ganhadores_Sena'] || 0),
        prize: parseFloat(row['Rateio_Sena'] || 0),
      }));

      setImportProgress(70);

      // Importar para o banco (em lotes)
      const batchSize = 100;
      for (let i = 0; i < draws.length; i += batchSize) {
        const batch = draws.slice(i, i + batchSize);
        await importDrawsMutation.mutateAsync({ draws: batch });
        setImportProgress(70 + (i / draws.length) * 30);
      }

      setImportProgress(100);
      
      toast.success('Importação concluída!', {
        description: `${draws.length} sorteios importados com sucesso.`,
      });

      // Recarregar página após 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      console.error('Erro na importação:', error);
      toast.error('Erro na importação', {
        description: error.message || 'Não foi possível importar o arquivo.',
      });
    } finally {
      setImporting(false);
      setImportProgress(0);
      event.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#0066CC] text-white sticky top-0 z-10 shadow-md">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <SettingsIcon className="w-8 h-8" />
                Configurações
              </h1>
              <p className="text-blue-100 mt-1 text-sm">
                Personalize sua experiência no LotoMind AI
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-white text-[#0066CC] hover:bg-gray-100 border-0"
              onClick={() => window.history.back()}
            >
              Voltar
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-6">
        {/* General Settings */}
        <Card className="bg-white border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-[#0066CC]">Configurações Gerais</CardTitle>
            <CardDescription className="text-gray-600">
              Ajuste as preferências padrão da aplicação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ticket-price">Valor do Bilhete (R$)</Label>
              <Input
                id="ticket-price"
                type="number"
                step="0.01"
                min="0"
                value={settings.ticketPrice}
                onChange={(e) => setSettings({ ...settings, ticketPrice: parseFloat(e.target.value) })}
                className="max-w-xs"
              />
              <p className="text-xs text-gray-500">
                Valor padrão para cálculo de custos (atualmente R$ 5,00 na Mega-Sena)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-period">Período Padrão de Análise</Label>
              <Select
                value={settings.defaultPeriod.toString()}
                onValueChange={(v) => setSettings({ ...settings, defaultPeriod: parseInt(v) })}
              >
                <SelectTrigger id="default-period" className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">Últimos 50 sorteios</SelectItem>
                  <SelectItem value="100">Últimos 100 sorteios</SelectItem>
                  <SelectItem value="200">Últimos 200 sorteios</SelectItem>
                  <SelectItem value="500">Últimos 500 sorteios</SelectItem>
                  <SelectItem value="1000">Últimos 1000 sorteios</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-strategy">Estratégia Padrão de IA</Label>
              <Select
                value={settings.defaultStrategy}
                onValueChange={(v) => setSettings({ ...settings, defaultStrategy: v })}
              >
                <SelectTrigger id="default-strategy" className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="statistical">Estatística Clássica</SelectItem>
                  <SelectItem value="regression">Regressão Linear</SelectItem>
                  <SelectItem value="clustering">Clustering K-means</SelectItem>
                  <SelectItem value="logistic">Regressão Logística</SelectItem>
                  <SelectItem value="neural">Rede Neural (IA)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSaveSettings} className="bg-[#00A859] hover:bg-[#008a47]">
              <Save className="w-4 h-4 mr-2" />
              Salvar Configurações
            </Button>
          </CardContent>
        </Card>

        {/* Import Data */}
        <Card className="bg-white border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-[#0066CC]">Importar Dados</CardTitle>
            <CardDescription className="text-gray-600">
              Atualize a base de dados com novos sorteios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-blue-900 mb-2">Formato do Arquivo Excel</h4>
              <p className="text-xs text-blue-800 mb-2">O arquivo deve conter as seguintes colunas:</p>
              <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                <li><strong>Concurso</strong>: Número do concurso</li>
                <li><strong>Data Sorteio</strong>: Data do sorteio (formato: DD/MM/AAAA)</li>
                <li><strong>Bola1, Bola2, Bola3, Bola4, Bola5, Bola6</strong>: Números sorteados</li>
                <li><strong>Ganhadores_Sena</strong> (opcional): Quantidade de ganhadores</li>
                <li><strong>Rateio_Sena</strong> (opcional): Valor do prêmio</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-upload" className="cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#0066CC] transition-colors">
                  <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-medium text-gray-700">
                    Clique para selecionar arquivo Excel
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Formatos aceitos: .xlsx, .xls
                  </p>
                </div>
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                disabled={importing}
              />
            </div>

            {importing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Importando...</span>
                  <span className="font-semibold text-[#0066CC]">{importProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#00A859] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${importProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-yellow-900">Atenção</h4>
                  <p className="text-xs text-yellow-800 mt-1">
                    A importação pode demorar alguns minutos dependendo do tamanho do arquivo.
                    Não feche esta página durante o processo.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="bg-white border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-[#0066CC]">Sobre o LotoMind AI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>
              <strong>Versão:</strong> 2.0.0
            </p>
            <p>
              <strong>Técnicas de IA:</strong> Estatística Clássica, Regressão Linear, Clustering K-means, 
              Regressão Logística, Rede Neural (TensorFlow.js)
            </p>
            <p className="text-xs text-gray-500 mt-4">
              Esta é uma ferramenta educacional de análise estatística. Não garantimos resultados em jogos de loteria.
              Jogue com responsabilidade.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
