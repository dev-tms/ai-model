import React from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
interface StatCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isUpward: boolean;
  };
  icon?: LucideIcon;
  description?: string;
}
export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  trend,
  icon: Icon,
  description
}) => {
  return <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-50 rounded-lg">
          {Icon && <Icon className="text-blue-600" size={24} />}
        </div>
        {trend && <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${trend.isUpward ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {trend.isUpward ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trend.value}%
          </div>}
      </div>
      
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
        {description && <p className="mt-2 text-xs text-slate-400 font-normal italic">{description}</p>}
      </div>
    </div>;
};