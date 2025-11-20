import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NumberBallProps {
  number: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'hot' | 'cold' | 'neutral' | 'selected';
  animated?: boolean;
  delay?: number;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-20 h-20 text-xl',
};

const variantClasses = {
  default: 'bg-white border-2 border-[#00A859] text-[#00A859] shadow-md font-bold',
  hot: 'bg-gradient-to-br from-red-500 to-orange-600 text-white shadow-lg shadow-red-500/50',
  cold: 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/50',
  neutral: 'bg-gradient-to-br from-gray-400 to-gray-600 text-white shadow-lg shadow-gray-500/50',
  selected: 'bg-[#FF8C00] text-white shadow-lg shadow-orange-500/50 ring-2 ring-orange-300 font-bold',
};

export function NumberBall({
  number,
  size = 'md',
  variant = 'default',
  animated = true,
  delay = 0,
  className,
}: NumberBallProps) {
  const ballContent = (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold',
        'border-2 border-white/20',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {number.toString().padStart(2, '0')}
    </div>
  );

  if (!animated) {
    return ballContent;
  }

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay,
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {ballContent}
    </motion.div>
  );
}
