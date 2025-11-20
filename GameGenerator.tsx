import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { NumberBall } from './NumberBall';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Sparkles, 
  Settings2, 
  Zap, 
  TrendingUp,
  Flame,
  Snowflake,
  Info,
  RefreshCw,
} from 'lucide-react';
import type { Draw } from '../../../drizzle/schema';
import { generateGame, generateMultipleGames, optimizeCards, strategies, type GameFilters } from '@/lib/gameGenerator';
import { classifyHotCold } from '@/lib/analytics';

interface GameGeneratorProps {
  draws: Draw[];
}

export function GameGenerator({ draws }: GameGeneratorProps) {
  const [selectedStrategy, setSelectedStrategy] = useState('statistical');
  const [numberOfGames, setNumberOfGames] = useState(1);
  const [numberOfNumbers, setNumberOfNumbers] = useState(6);
  const [optimizationLevel, setOptimizationLevel] = useState<'complete' | 'optimized' | 'economical'>('optimized');
  const [generatedGames, setGeneratedGames] = useState<number[][]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState<GameFilters>({
    minEven: 2,
    maxEven: 4,
    minLow: 2,
    maxLow: 4,
    allowConsecutive: true,
    maxConsecutive: 2,
    minHot: 1,
    maxCold: 2,
  });

  const strategy = strategies[selectedStrategy];
  const hotColdNumbers = useMemo(() => classifyHotCold(draws, 100), [draws]);

  const handleGenerate = () => {
    if (numberOfNumbers === 6) {
      // Generate simple games
      const games = generateMultipleGames(draws, strategy, filters, numberOfGames);
      setGeneratedGames(games);
    } else {
      // Generate with optimization
      const selectedNums: number[] = [];
      // For demo, select top numbers by strategy
      const scores = new Map<number, number>();
      
      // Simple scoring based on hot/cold
      hotColdNumbers.forEach(h => {
        let score = 0;
        if (h.temperature === 'hot') score = 3;
        else if (h.temperature === 'neutral') score = 2;
        else score = 1;
        scores.set(h.number, score);
      });
      
      const sorted = Array.from(scores.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([num]) => num);
      
      const selected = sorted.slice(0, numberOfNumbers);
      const result = optimizeCards(selected, optimizationLevel);
      setGeneratedGames(result.cards);
    }
  };

  const estimatedCost = numberOfNumbers === 6 
    ? numberOfGames * 5.0 
    : optimizeCards(Array.from({ length: numberOfNumbers }, (_, i) => i + 1), optimizationLevel).totalCost;

  return (
    <div className="space-y-6">
      {/* Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            Configuração do Jogo
          </CardTitle>
          <CardDescription>
            Configure quantos números deseja gerar e quantos jogos diferentes criar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Number Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="number-count" className="text-base font-semibold">
                Quantos números deseja gerar?
              </Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-2xl font-mono px-4 py-2">
                  {numberOfNumbers}
                </Badge>
              </div>
            </div>
            <Slider
              id="number-count"
              min={6}
              max={20}
              step={1}
              value={[numberOfNumbers]}
              onValueChange={(value) => setNumberOfNumbers(value[0])}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              {numberOfNumbers === 6 
                ? 'Gerando jogos simples de 6 números'
                : `Gerando ${numberOfNumbers} números (será otimizado em múltiplos cartões)`
              }
            </p>
          </div>

          <Separator />

          {/* Game Quantity */}
          <div className="space-y-4">
            <Label htmlFor="game-count" className="text-base font-semibold">
              Quantos jogos diferentes gerar?
            </Label>
            <Select value={numberOfGames.toString()} onValueChange={(v) => setNumberOfGames(parseInt(v))}>
              <SelectTrigger id="game-count">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 jogo</SelectItem>
                <SelectItem value="3">3 jogos</SelectItem>
                <SelectItem value="5">5 jogos</SelectItem>
                <SelectItem value="10">10 jogos</SelectItem>
                <SelectItem value="20">20 jogos</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Cada jogo terá {numberOfNumbers} números otimizados
            </p>
          </div>

          {/* Optimization Level (only for > 6 numbers) */}
          {numberOfNumbers > 6 && (
            <>
              <Separator />
              <div className="space-y-4">
                <Label className="text-base font-semibold">Nível de Otimização</Label>
                <Tabs value={optimizationLevel} onValueChange={(v) => setOptimizationLevel(v as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="economical">💰 Econômico</TabsTrigger>
                    <TabsTrigger value="optimized">
                      ⚡ Otimizado
                      <Badge variant="secondary" className="ml-2">Recomendado</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="complete">💎 Completo</TabsTrigger>
                  </TabsList>
                  <TabsContent value="economical" className="mt-4">
                    <p className="text-sm text-muted-foreground">
                      Mínimo de cartões possível. Menor custo, menor cobertura.
                    </p>
                  </TabsContent>
                  <TabsContent value="optimized" className="mt-4">
                    <p className="text-sm text-muted-foreground">
                      Cobertura inteligente com menos cartões. Melhor custo-benefício.
                    </p>
                  </TabsContent>
                  <TabsContent value="complete" className="mt-4">
                    <p className="text-sm text-muted-foreground">
                      Todas as combinações possíveis. Máxima cobertura, maior custo.
                    </p>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}

          <Separator />

          {/* Cost Estimate */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Custo Estimado</p>
                <p className="text-xs text-muted-foreground">
                  {numberOfNumbers === 6 
                    ? `${numberOfGames} cartão${numberOfGames > 1 ? 'es' : ''} × R$ 5,00`
                    : 'Baseado no nível de otimização'
                  }
                </p>
              </div>
              <div className="text-2xl font-bold text-primary">
                R$ {estimatedCost.toFixed(2)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategy Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Estratégia de IA
          </CardTitle>
          <CardDescription>
            Escolha a técnica de análise para gerar os números
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
              {Object.entries(strategies).map(([key, strat]) => (
                <button
                  key={key}
                  onClick={() => setSelectedStrategy(key)}
                  className={`text-xs font-semibold py-2 px-3 rounded-lg border-2 transition-all ${
                    selectedStrategy === key
                      ? 'border-[#0066CC] bg-[#0066CC] text-white shadow-md'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-[#0066CC]'
                  }`}
                >
                  {strat.name}
                </button>
              ))}
            </div>
            {strategy && (
              <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-muted-foreground">{strategy.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-primary/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${strategy.weights.frequency * 100}%` }}
                      />
                    </div>
                    <span>Frequência</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-primary/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${strategy.weights.gap * 100}%` }}
                      />
                    </div>
                    <span>Gaps</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-primary/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${strategy.weights.trend * 100}%` }}
                      />
                    </div>
                    <span>Tendência</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-primary/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${strategy.weights.temperature * 100}%` }}
                      />
                    </div>
                    <span>Temperatura</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-primary" />
              Filtros Avançados
            </CardTitle>
            <Switch
              checked={showAdvancedFilters}
              onCheckedChange={setShowAdvancedFilters}
            />
          </div>
          <CardDescription>
            Aplique filtros adicionais para refinar os jogos gerados
          </CardDescription>
        </CardHeader>
        {showAdvancedFilters && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Parity */}
              <div className="space-y-2">
                <Label>Números Pares (mín-máx)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={6}
                    value={filters.minEven || 0}
                    onChange={(e) => setFilters({ ...filters, minEven: parseInt(e.target.value) })}
                    className="w-20"
                  />
                  <span className="flex items-center">-</span>
                  <Input
                    type="number"
                    min={0}
                    max={6}
                    value={filters.maxEven || 6}
                    onChange={(e) => setFilters({ ...filters, maxEven: parseInt(e.target.value) })}
                    className="w-20"
                  />
                </div>
              </div>

              {/* Low/High */}
              <div className="space-y-2">
                <Label>Números Baixos 1-30 (mín-máx)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={6}
                    value={filters.minLow || 0}
                    onChange={(e) => setFilters({ ...filters, minLow: parseInt(e.target.value) })}
                    className="w-20"
                  />
                  <span className="flex items-center">-</span>
                  <Input
                    type="number"
                    min={0}
                    max={6}
                    value={filters.maxLow || 6}
                    onChange={(e) => setFilters({ ...filters, maxLow: parseInt(e.target.value) })}
                    className="w-20"
                  />
                </div>
              </div>

              {/* Consecutive */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={filters.allowConsecutive}
                    onCheckedChange={(checked) => setFilters({ ...filters, allowConsecutive: checked })}
                  />
                  <Label>Permitir Consecutivos</Label>
                </div>
                {filters.allowConsecutive && (
                  <div>
                    <Label className="text-xs">Máximo de consecutivos</Label>
                    <Input
                      type="number"
                      min={2}
                      max={6}
                      value={filters.maxConsecutive || 2}
                      onChange={(e) => setFilters({ ...filters, maxConsecutive: parseInt(e.target.value) })}
                      className="w-20 mt-1"
                    />
                  </div>
                )}
              </div>

              {/* Temperature */}
              <div className="space-y-2">
                <Label>Temperatura</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-red-500" />
                    <Label className="text-xs">Mín. Quentes</Label>
                    <Input
                      type="number"
                      min={0}
                      max={6}
                      value={filters.minHot || 0}
                      onChange={(e) => setFilters({ ...filters, minHot: parseInt(e.target.value) })}
                      className="w-16"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Snowflake className="w-4 h-4 text-blue-500" />
                    <Label className="text-xs">Máx. Frios</Label>
                    <Input
                      type="number"
                      min={0}
                      max={6}
                      value={filters.maxCold || 6}
                      onChange={(e) => setFilters({ ...filters, maxCold: parseInt(e.target.value) })}
                      className="w-16"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        size="lg"
        className="w-full"
      >
        <Sparkles className="w-5 h-5 mr-2" />
        Gerar Jogos com IA
      </Button>

      {/* Generated Games */}
      {generatedGames.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Jogos Gerados
              </CardTitle>
              <CardDescription>
                {generatedGames.length} jogo{generatedGames.length > 1 ? 's' : ''} gerado{generatedGames.length > 1 ? 's' : ''} com sucesso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedGames.map((game, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      Jogo {index + 1} de {generatedGames.length}
                    </p>
                    <Badge variant="outline">R$ 5,00</Badge>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {game.map((num, idx) => (
                      <NumberBall
                        key={idx}
                        number={num}
                        size="md"
                        delay={idx * 0.05}
                      />
                    ))}
                  </div>
                  {index < generatedGames.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
              
              <Separator />
              
              <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div>
                  <p className="font-semibold">Custo Total</p>
                  <p className="text-xs text-muted-foreground">
                    {generatedGames.length} cartão{generatedGames.length > 1 ? 'es' : ''} × R$ 5,00
                  </p>
                </div>
                <div className="text-2xl font-bold text-primary">
                  R$ {(generatedGames.length * 5.0).toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
