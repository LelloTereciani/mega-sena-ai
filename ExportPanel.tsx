import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import type { Draw } from '../../../drizzle/schema';
import {
  exportFrequencyToCSV,
  exportGapsToCSV,
  exportHotColdToCSV,
  exportPairsToCSV,
  exportTriosToCSV,
  exportGamesToCSV,
  generatePDFReport,
} from '@/lib/export';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface ExportPanelProps {
  draws: Draw[];
  generatedGames?: number[][];
}

export function ExportPanel({ draws, generatedGames }: ExportPanelProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (type: string, exportFn: () => void) => {
    setExporting(type);
    try {
      exportFn();
      toast.success('Exportação concluída!', {
        description: 'Arquivo baixado com sucesso.',
      });
    } catch (error) {
      toast.error('Erro na exportação', {
        description: 'Não foi possível exportar o arquivo.',
      });
    } finally {
      setTimeout(() => setExporting(null), 1000);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Exportar Análises (CSV)
          </CardTitle>
          <CardDescription>
            Exporte tabelas de análise estatística em formato CSV
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={() => handleExport('frequency', () => exportFrequencyToCSV(draws))}
            variant="outline"
            className="w-full justify-start"
            disabled={exporting !== null}
          >
            {exporting === 'frequency' ? (
              <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Frequência de Números
          </Button>

          <Button
            onClick={() => handleExport('gaps', () => exportGapsToCSV(draws))}
            variant="outline"
            className="w-full justify-start"
            disabled={exporting !== null}
          >
            {exporting === 'gaps' ? (
              <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Análise de Gaps
          </Button>

          <Button
            onClick={() => handleExport('hotcold', () => exportHotColdToCSV(draws))}
            variant="outline"
            className="w-full justify-start"
            disabled={exporting !== null}
          >
            {exporting === 'hotcold' ? (
              <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Números Quentes/Frios
          </Button>

          <Button
            onClick={() => handleExport('pairs', () => exportPairsToCSV(draws))}
            variant="outline"
            className="w-full justify-start"
            disabled={exporting !== null}
          >
            {exporting === 'pairs' ? (
              <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Duplas Frequentes
          </Button>

          <Button
            onClick={() => handleExport('trios', () => exportTriosToCSV(draws))}
            variant="outline"
            className="w-full justify-start"
            disabled={exporting !== null}
          >
            {exporting === 'trios' ? (
              <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Trios Frequentes
          </Button>

          {generatedGames && generatedGames.length > 0 && (
            <>
              <Separator />
              <Button
                onClick={() => handleExport('games', () => exportGamesToCSV(generatedGames))}
                variant="outline"
                className="w-full justify-start"
                disabled={exporting !== null}
              >
                {exporting === 'games' ? (
                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Jogos Gerados ({generatedGames.length})
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Relatório Completo (PDF)
          </CardTitle>
          <CardDescription>
            Gere um relatório completo com todas as análises e gráficos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => handleExport('pdf', () => generatePDFReport(draws, generatedGames))}
            className="w-full"
            size="lg"
            disabled={exporting !== null}
          >
            {exporting === 'pdf' ? (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2 text-white" />
                PDF Gerado!
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Gerar Relatório PDF
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-3">
            O relatório incluirá análises estatísticas, números quentes/frios,
            duplas frequentes e jogos gerados (se houver)
          </p>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Dica:</strong> Use os arquivos CSV para análises adicionais em Excel ou Google Sheets.
            O relatório PDF é ideal para compartilhamento e impressão.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
