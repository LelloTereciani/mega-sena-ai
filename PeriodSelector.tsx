import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';

interface PeriodSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const PERIOD_OPTIONS = [
  { value: 50, label: 'Últimos 50 sorteios' },
  { value: 100, label: 'Últimos 100 sorteios' },
  { value: 200, label: 'Últimos 200 sorteios' },
  { value: 500, label: 'Últimos 500 sorteios' },
  { value: 1000, label: 'Últimos 1000 sorteios' },
  { value: 2000, label: 'Últimos 2000 sorteios' },
  { value: -1, label: 'Todos os sorteios' },
];

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4 text-gray-500" />
      <Select value={value.toString()} onValueChange={(v) => onChange(parseInt(v))}>
        <SelectTrigger className="w-[200px] bg-white border-gray-300">
          <SelectValue placeholder="Selecione o período" />
        </SelectTrigger>
        <SelectContent>
          {PERIOD_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value.toString()}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
