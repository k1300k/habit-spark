import { useState } from 'react';
import { motion } from 'framer-motion';
import { useActivityStore, Session } from '@/store/useActivityStore';
import { cn } from '@/lib/utils';

type Period = 'today' | 'week' | 'month' | 'all';

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}초`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
}

function getDateRange(period: Period): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  let start: Date;
  
  switch (period) {
    case 'today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      start = new Date(now);
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      break;
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'all':
    default:
      start = new Date(0);
      break;
  }
  
  return { start, end };
}

function isSessionInRange(session: Session, start: Date, end: Date): boolean {
  const sessionDate = new Date(session.date);
  return sessionDate >= start && sessionDate <= end;
}

export function Dashboard() {
  const [period, setPeriod] = useState<Period>('today');
  const { activities, sessions, getStreakDays } = useActivityStore();
  
  const { start, end } = getDateRange(period);
  const filteredSessions = sessions.filter((s) => isSessionInRange(s, start, end));
  
  // Calculate stats
  const totalCount = filteredSessions.length;
  const totalDuration = filteredSessions.reduce((sum, s) => sum + s.duration, 0);
  
  // Get activity stats
  const activityStats = activities.map((activity) => {
    const activitySessions = filteredSessions.filter((s) => s.activityId === activity.id);
    const count = activitySessions.length;
    const duration = activitySessions.reduce((sum, s) => sum + s.duration, 0);
    const streak = getStreakDays(activity.id);
    
    return {
      ...activity,
      count,
      duration,
      streak,
    };
  }).sort((a, b) => b.count - a.count);
  
  // Get max streak
  const maxStreak = Math.max(...activities.map((a) => getStreakDays(a.id)), 0);
  
  // Generate heatmap data for last 7 days
  const heatmapData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const count = sessions.filter((s) => s.date === dateStr).length;
    return {
      date: dateStr,
      dayName: ['일', '월', '화', '수', '목', '금', '토'][date.getDay()],
      count,
    };
  });
  
  const maxHeatmapCount = Math.max(...heatmapData.map((d) => d.count), 1);
  
  const periods: { id: Period; label: string }[] = [
    { id: 'today', label: '오늘' },
    { id: 'week', label: '이번 주' },
    { id: 'month', label: '이번 달' },
    { id: 'all', label: '전체' },
  ];
  
  return (
    <div className="p-4 pb-24 animate-fade-in-up">
      {/* Period Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {periods.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              period === p.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      
      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-5 shadow-card mb-6"
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-foreground">{totalCount}</p>
            <p className="text-xs text-muted-foreground mt-1">완료</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">
              {totalDuration < 3600 
                ? `${Math.floor(totalDuration / 60)}분`
                : `${Math.floor(totalDuration / 3600)}h`
              }
            </p>
            <p className="text-xs text-muted-foreground mt-1">총 시간</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">
              {maxStreak > 0 ? `${maxStreak}일` : '-'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {maxStreak >= 3 ? '🔥 연속' : '연속'}
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Heatmap */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">7일 활동</h3>
        <div className="grid grid-cols-7 gap-2">
          {heatmapData.map((day, i) => (
            <div key={day.date} className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors',
                  day.count === 0
                    ? 'bg-muted text-muted-foreground'
                    : 'text-primary-foreground'
                )}
                style={{
                  backgroundColor: day.count > 0 
                    ? `hsl(207, 90%, ${Math.max(30, 54 - (day.count / maxHeatmapCount) * 24)}%)`
                    : undefined
                }}
              >
                {day.count || '-'}
              </div>
              <span className="text-xs text-muted-foreground mt-1">{day.dayName}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Activity Stats */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">활동별 통계</h3>
        <div className="space-y-3">
          {activityStats.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 bg-card rounded-xl p-4 shadow-card"
            >
              <div className="text-3xl">{activity.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground truncate">{activity.name}</p>
                  {activity.streak >= 3 && (
                    <span className="text-xs">🔥{activity.streak}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {activity.count > 0 
                    ? `${activity.count}회 · ${formatDuration(activity.duration)}`
                    : '기록 없음'
                  }
                </p>
              </div>
              {index < 3 && activity.count > 0 && (
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground',
                  index === 0 ? 'bg-activity-yellow' : 
                  index === 1 ? 'bg-muted-foreground' : 
                  'bg-activity-orange'
                )}>
                  {index + 1}
                </div>
              )}
            </motion.div>
          ))}
          
          {activityStats.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>아직 활동이 없습니다</p>
              <p className="text-sm mt-1">첫 번째 활동을 추가해보세요!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
