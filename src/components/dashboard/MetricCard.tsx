// src/components/dashboard/MetricCard.tsx
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  delay?: number;
}

export function MetricCard({ title, value, subtitle, icon: Icon, trend, trendValue, delay = 0 }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, type: 'spring' }}
      className="bg-omni-surface border border-omni-border rounded-xl p-5 flex flex-col relative overflow-hidden group hover:border-omni-accent/50 transition-colors"
    >
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-omni-accent/5 rounded-full blur-2xl group-hover:bg-omni-accent/10 transition-colors pointer-events-none"></div>

      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
        <div className="p-2 bg-omni-border/50 rounded-lg text-slate-300">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="flex items-baseline gap-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">{value}</h2>
        {trend && (
          <span className={`text-xs font-semibold ${
            trend === 'up' ? 'text-omni-danger' : 
            trend === 'down' ? 'text-omni-success' : 'text-slate-400'
          }`}>
            {trendValue}
          </span>
        )}
      </div>
      
      {subtitle && <p className="text-xs text-slate-500 mt-2">{subtitle}</p>}
    </motion.div>
  );
}