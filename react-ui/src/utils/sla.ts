export interface SLAInfo {
  label: string;
  shortLabel: string;
  badgeClass: string;
  progressPercent: number; // 0 to 100
  barColor: string;
  isBreached: boolean;
  hoursRemaining: number;
}

export function calculateSLA(slaDeadlineStr?: string, status?: string): SLAInfo | null {
  if (!slaDeadlineStr) return null;

  const normalizedStatus = (status || '').toLowerCase();
  if (['resolved', 'closed'].includes(normalizedStatus)) {
    return {
      label: 'SLA Met / Resolved',
      shortLabel: 'SLA Met',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      progressPercent: 100,
      barColor: 'bg-emerald-500',
      isBreached: false,
      hoursRemaining: 999,
    };
  }

  const deadline = new Date(slaDeadlineStr).getTime();
  if (isNaN(deadline)) return null;

  const now = Date.now();
  const diffMs = deadline - now;
  const hoursLeft = Math.round(diffMs / (1000 * 60 * 60));

  if (diffMs <= 0) {
    const overdueHrs = Math.abs(hoursLeft);
    const label = overdueHrs === 0 ? 'SLA Due Now' : `SLA Breached (${overdueHrs}h overdue)`;
    return {
      label,
      shortLabel: overdueHrs === 0 ? 'Due Now' : `${overdueHrs}h overdue`,
      badgeClass: 'bg-red-50 text-red-700 border-red-200 animate-pulse font-bold',
      progressPercent: 100,
      barColor: 'bg-red-500',
      isBreached: true,
      hoursRemaining: hoursLeft,
    };
  }

  if (hoursLeft <= 12) {
    return {
      label: `SLA Due Soon (${hoursLeft}h left)`,
      shortLabel: `${hoursLeft}h left (Warning)`,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 font-semibold',
      progressPercent: Math.min(95, Math.max(20, 100 - (hoursLeft / 24) * 60)),
      barColor: 'bg-amber-500',
      isBreached: false,
      hoursRemaining: hoursLeft,
    };
  }

  const daysLeft = Math.floor(hoursLeft / 24);
  const remainingText = daysLeft > 0 ? `${daysLeft}d ${hoursLeft % 24}h left` : `${hoursLeft}h left`;
  return {
    label: `SLA On-Track (${remainingText})`,
    shortLabel: `${remainingText}`,
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium',
    progressPercent: Math.min(75, Math.max(10, 100 - (hoursLeft / 72) * 60)),
    barColor: 'bg-emerald-500',
    isBreached: false,
    hoursRemaining: hoursLeft,
  };
}
