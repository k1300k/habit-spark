import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useActivities } from '@/contexts/ActivityContext';
import { getIconComponent } from '@/lib/iconMapping';
import { cn } from '@/lib/utils';

interface ActivityCardProps {
  activityId: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function ActivityCard({ activityId }: ActivityCardProps) {
  const { activities, activeTimers, startTimer, getTodayCount, getStreakDays } = useActivities();
  const activity = activities.find((a) => a.id === activityId);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const activeTimer = activeTimers.find(t => t.activityId === activityId);
  const isActive = !!activeTimer;
  const todayCount = getTodayCount(activityId);
  const streakDays = getStreakDays(activityId);
  
  useEffect(() => {
    if (!isActive || !activeTimer) {
      setElapsedTime(0);
      return;
    }
    
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - activeTimer.startTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isActive, activeTimer]);
  
  if (!activity) return null;
  
  const IconComponent = getIconComponent(activity.icon);
  
  const handleTap = () => {
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    startTimer(activityId);
  };
  
  return (
    <motion.button
      onClick={handleTap}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'relative flex flex-col items-center justify-center p-4 rounded-2xl',
        'min-h-[120px] sm:min-h-[140px] w-full transition-all duration-300',
        'shadow-card active:shadow-none',
        'touch-manipulation select-none',
        isActive 
          ? 'bg-card-active animate-timer-pulse' 
          : 'bg-card active:bg-secondary/50'
      )}
    >
      {/* Count badge */}
      {todayCount > 0 && (
        <div className="absolute top-2 right-2 bg-foreground/10 text-foreground text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full">
          ×{todayCount}
        </div>
      )}
      
      {/* Streak badge */}
      {streakDays >= 3 && (
        <div className="absolute top-2 left-2 text-[10px] sm:text-xs font-medium text-orange-500">
          🔥{streakDays}
        </div>
      )}
      
      {/* Icon */}
      <div className={cn(
        'mb-2 transition-transform',
        isActive ? 'text-primary' : 'text-foreground'
      )}>
        <IconComponent size={36} strokeWidth={1.5} className="sm:w-11 sm:h-11" />
      </div>
      
      {/* Name */}
      <p className="text-xs sm:text-sm font-medium text-foreground truncate max-w-full px-1">
        {activity.name}
      </p>
      
      {/* Timer */}
      <div className={cn(
        'mt-1.5 font-mono text-xs sm:text-sm transition-all',
        isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
      )}>
        {isActive ? formatTime(elapsedTime) : '00:00'}
      </div>
      
      {/* Active indicator */}
      {isActive && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full"
        />
      )}
    </motion.button>
  );
}
