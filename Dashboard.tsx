import { useState } from 'react';
import { motion } from 'framer-motion';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NumberBall } from '@/components/NumberBall';
import { GameGenerator } from '@/components/GameGenerator';
import { ExportPanel } from '@/components/ExportPanel';
import { PeriodSelector } from '@/components/PeriodSelector';
import { AnalysisCharts } from '@/components/AnalysisCharts';
import {
  BarChart3,
  TrendingUp,
  Flame,
  Snowflake,
  Brain,
  Download,
  Upload,
  Sparkles,
  Settings,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState(100);
  
  const { data: drawsCount, isLoading: isLoadingCount } = trpc.draws.count.useQuery();
  const { data: latestDraws, isLoading: isLoadingDraws } = trpc.draws.latest.useQuery({ 
    limit: selectedPeriod === -1 ? 999999 : selectedPeriod 
  });
  const { data: allDraws } = trpc.draws.list.useQuery();

  const lastDraw = latestDraws?.[0];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Azul Caixa */}
      <header className="bg-[#0066CC] text-white sticky top-0 z-10 shadow-md">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Sparkles className="w-8 h-8" />
                LotoMind AI
              </h1>
              <p className="text-blue-100 mt-1 text-sm">
                Análise Inteligente de Loterias - Mega-Sena
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white text-[#0066CC] hover:bg-gray-100 border-0"
                onClick={() => window.location.href = '/settings'}
              >
                <Upload className="w-4 h-4 mr-2" />
                Importar Excel
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white text-[#0066CC] hover:bg-gray-100 border-0"
                onClick={() => window.location.href = '/settings'}
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-0 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total de Sorteios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingCount ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <div className="text-3xl font-bold text-[#0066CC]">{drawsCount?.toLocaleString()}</div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-white border-0 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Período Analisado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#0066CC]">{selectedPeriod}</div>
                  <p className="text-xs text-gray-500 mt-1">últimos sorteios</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-white border-0 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Técnicas de IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#0066CC]">5</div>
                  <p className="text-xs text-gray-500 mt-1">algoritmos ativos</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-white border-0 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Último Concurso
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingDraws ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <div className="text-3xl font-bold text-[#0066CC]">#{lastDraw?.contest}</div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Period Selector */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Período de Análise</h3>
                    <p className="text-xs text-gray-500">Selecione o intervalo de sorteios para análise</p>
                  </div>
                  <PeriodSelector value={selectedPeriod} onChange={setSelectedPeriod} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Last Draw */}
          {lastDraw && (
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#0066CC]">
                    <Sparkles className="w-5 h-5" />
                    Último Sorteio - Concurso {lastDraw.contest}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {new Date(lastDraw.drawDate).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3 justify-center flex-wrap">
                    {[lastDraw.ball1, lastDraw.ball2, lastDraw.ball3, lastDraw.ball4, lastDraw.ball5, lastDraw.ball6].map(
                      (ball, index) => (
                        <NumberBall
                          key={index}
                          number={ball}
                          size="lg"
                          delay={index * 0.1}
                        />
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Main Content Tabs */}
          <motion.div variants={itemVariants}>
            <Tabs defaultValue="analysis" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="analysis">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Análises
                </TabsTrigger>
                <TabsTrigger value="generator">
                  <Brain className="w-4 h-4 mr-2" />
                  Gerador IA
                </TabsTrigger>
                <TabsTrigger value="patterns">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Padrões
                </TabsTrigger>
                <TabsTrigger value="export">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="analysis" className="mt-6">
                {latestDraws && latestDraws.length > 0 ? (
                  <AnalysisCharts draws={latestDraws} />
                ) : (
                  <Card className="bg-white border-0 shadow-md">
                    <CardContent className="py-12">
                      <div className="text-center text-gray-500">
                        Carregando análises...
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="generator" className="mt-6">
                {latestDraws && latestDraws.length > 0 ? (
                  <GameGenerator draws={latestDraws} />
                ) : (
                  <Card>
                    <CardContent className="py-12">
                      <div className="text-center text-muted-foreground">
                        Carregando dados...
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="patterns" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Padrões e Tendências
                    </CardTitle>
                    <CardDescription>
                      Análise de padrões, sequências e combinações frequentes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96 flex items-center justify-center text-muted-foreground">
                      Análise de padrões será implementada aqui
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="export" className="mt-6">
                {latestDraws && latestDraws.length > 0 ? (
                  <ExportPanel draws={latestDraws} />
                ) : (
                  <Card>
                    <CardContent className="py-12">
                      <div className="text-center text-muted-foreground">
                        Carregando dados...
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            <strong>Aviso:</strong> Esta é uma ferramenta educacional de análise estatística.
            Não garantimos resultados em jogos de loteria. Jogue com responsabilidade.
          </p>
        </div>
      </footer>
    </div>
  );
}
