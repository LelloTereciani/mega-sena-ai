import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import type { Draw } from '../../../drizzle/schema';
import { calculateFrequency, calculateGaps, classifyHotCold } from '@/lib/analytics';
import { Flame, Snowflake, TrendingUp, BarChart3 } from 'lucide-react';

interface AnalysisChartsProps {
  draws: Draw[];
}

const COLORS = {
  primary: '#0066CC',
  green: '#00A859',
  orange: '#FF8C00',
  red: '#DC2626',
  blue: '#00A3E0',
};

export function AnalysisCharts({ draws }: AnalysisChartsProps) {
  const frequency = calculateFrequency(draws).slice(0, 20);
  const gaps = calculateGaps(draws).slice(0, 15);
  const hotCold = classifyHotCold(draws, 100);
  
  const hotNumbers = hotCold.filter(h => h.temperature === 'hot').slice(0, 10);
  const coldNumbers = hotCold.filter(h => h.temperature === 'cold').slice(0, 10);
  
  // Par/Ímpar distribution
  let evenCount = 0;
  let oddCount = 0;
  draws.forEach(draw => {
    [draw.ball1, draw.ball2, draw.ball3, draw.ball4, draw.ball5, draw.ball6].forEach(ball => {
      if (ball % 2 === 0) evenCount++;
      else oddCount++;
    });
  });
  
  const parityData = [
    { name: 'Pares', value: evenCount, fill: COLORS.primary },
    { name: 'Ímpares', value: oddCount, fill: COLORS.orange },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Frequency Chart */}
      <Card className="bg-white border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0066CC]">
            <BarChart3 className="w-5 h-5" />
            Frequência de Números
          </CardTitle>
          <CardDescription className="text-gray-600">
            Top 20 números mais sorteados no período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={frequency}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="number" 
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickFormatter={(value) => value.toString().padStart(2, '0')}
              />
              <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
                labelFormatter={(value) => `Número ${value.toString().padStart(2, '0')}`}
              />
              <Bar dataKey="count" fill={COLORS.green} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gaps Chart */}
      <Card className="bg-white border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0066CC]">
            <TrendingUp className="w-5 h-5" />
            Análise de Gaps
          </CardTitle>
          <CardDescription className="text-gray-600">
            Intervalo médio entre aparições
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={gaps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="number" 
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickFormatter={(value) => value.toString().padStart(2, '0')}
              />
              <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
                labelFormatter={(value) => `Número ${value.toString().padStart(2, '0')}`}
              />
              <Line 
                type="monotone" 
                dataKey="averageGap" 
                stroke={COLORS.primary} 
                strokeWidth={2}
                dot={{ fill: COLORS.primary, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Hot Numbers */}
      <Card className="bg-white border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Flame className="w-5 h-5" />
            Números Quentes
          </CardTitle>
          <CardDescription className="text-gray-600">
            Mais frequentes nos últimos 100 sorteios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hotNumbers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 12 }} />
              <YAxis 
                type="category" 
                dataKey="number" 
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickFormatter={(value) => value.toString().padStart(2, '0')}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
                labelFormatter={(value) => `Número ${value.toString().padStart(2, '0')}`}
              />
              <Bar dataKey="recentAppearances" fill={COLORS.red} radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cold Numbers */}
      <Card className="bg-white border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600">
            <Snowflake className="w-5 h-5" />
            Números Frios
          </CardTitle>
          <CardDescription className="text-gray-600">
            Menos frequentes nos últimos 100 sorteios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={coldNumbers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 12 }} />
              <YAxis 
                type="category" 
                dataKey="number" 
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickFormatter={(value) => value.toString().padStart(2, '0')}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
                labelFormatter={(value) => `Número ${value.toString().padStart(2, '0')}`}
              />
              <Bar dataKey="recentAppearances" fill={COLORS.blue} radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Parity Distribution */}
      <Card className="bg-white border-0 shadow-md lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-[#0066CC]">Distribuição Par/Ímpar</CardTitle>
          <CardDescription className="text-gray-600">
            Análise histórica de {draws.length} sorteios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={parityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {parityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#0066CC]">{evenCount}</div>
              <div className="text-sm text-gray-600">Números Pares</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#FF8C00]">{oddCount}</div>
              <div className="text-sm text-gray-600">Números Ímpares</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
