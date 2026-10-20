import React from 'react';
import {
  Users,
  UserPlus,
  UserMinus,
  Clock,
  Activity,
  ArrowUpRight,
} from 'lucide-react';

export type MetricVariant = 'blue' | 'green' | 'amber' | 'purple' | 'rose' | 'teal' | 'standard' | 'elevated' | 'alt';

export interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  variant?: MetricVariant;
  icon?: any;
}

const getCardTheme = (label: string, variant?: MetricVariant) => {
  const l = label.toLowerCase();
  if (variant === 'blue' || l.includes('total') || l.includes('headcount') || l.includes('employee')) {
    return {
      icon: Users,
      iconBg: 'bg-gradient-to-br from-blue-500/10 to-indigo-500/20 text-blue-600 border-blue-200/70',
      accentColor: 'from-blue-500 to-indigo-600',
      badge: 'Active Staff',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    };
  }
  if (variant === 'green' || l.includes('join') || l.includes('present') || l.includes('approved') || l.includes('rate')) {
    return {
      icon: UserPlus,
      iconBg: 'bg-gradient-to-br from-emerald-500/10 to-teal-500/20 text-emerald-600 border-emerald-200/70',
      accentColor: 'from-emerald-500 to-teal-600',
      badge: 'Q4 Onboarding',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }
  if (variant === 'rose' || l.includes('reliev') || l.includes('exit') || l.includes('left') || l.includes('leave')) {
    return {
      icon: UserMinus,
      iconBg: 'bg-gradient-to-br from-rose-500/10 to-amber-500/20 text-rose-600 border-rose-200/70',
      accentColor: 'from-rose-500 to-amber-600',
      badge: 'Separations',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    };
  }
  if (l.includes('pending') || l.includes('approval') || l.includes('claim')) {
    return {
      icon: Clock,
      iconBg: 'bg-gradient-to-br from-amber-500/10 to-orange-500/20 text-amber-600 border-amber-200/70',
      accentColor: 'from-amber-500 to-orange-600',
      badge: 'Action Required',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  }
  return {
    icon: Activity,
    iconBg: 'bg-gradient-to-br from-slate-500/10 to-blue-500/20 text-slate-700 border-slate-200/70',
    accentColor: 'from-slate-600 to-slate-800',
    badge: 'Metric Pulse',
    badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
  };
};

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtitle,
  variant,
  icon: CustomIcon,
}) => {
  const theme = getCardTheme(label, variant);
  const IconComponent = CustomIcon || theme.icon;

  return (
    <div className="group relative bg-white border border-slate-200/90 hover:border-blue-300 rounded-xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col justify-between">
      {/* Top subtle highlight gradient bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.accentColor} opacity-70 group-hover:opacity-100 transition-opacity`} />

      <div>
        {/* Card Header: Icon + Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold border shadow-xs transition-transform group-hover:scale-105 ${theme.iconBg}`}>
              <IconComponent className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-semibold text-slate-600 tracking-tight">
              {label}
            </span>
          </div>

          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs font-mono uppercase tracking-wider ${theme.badgeColor}`}>
            {theme.badge}
          </span>
        </div>

        {/* Value with modern bold display typography */}
        <div className="mt-2 flex items-baseline gap-2">
          <div className="text-3xl font-extrabold font-heading text-slate-900 tracking-tight leading-none group-hover:text-blue-900 transition-colors">
            {value}
          </div>
        </div>
      </div>

      {/* Subtitle / Context Note */}
      {subtitle && (
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-sans">
          <span className="flex items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-500 transition-colors"></span>
            <span className="truncate">{subtitle}</span>
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
        </div>
      )}
    </div>
  );
};
