import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useActivityStore } from '@/store/useActivityStore';
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
  const { activities, currentTimer, startTimer, getTodayCount, getStreakDays } = useActivityStore();
  const activity = activities.find((a) => a.id === activityId);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const isActive = currentTimer.activityId === activityId && currentTimer.startTime !== null;
  const todayCount = getTodayCount(activityId);
  const streakDays = getStreakDays(activityId);
  
  useEffect(() => {
    if (!isActive || !currentTimer.startTime) {
      setElapsedTime(0);
      return;
    }
    
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - currentTimer.startTime!) / 1000);
      setElapsedTime(elapsed);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isActive, currentTimer.startTime]);
  
  if (!activity) return null;
  
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
        'min-h-[140px] w-full transition-all duration-300',
        'shadow-card hover:shadow-card-hover',
        'touch-manipulation select-none',
        isActive 
          ? 'bg-card-active animate-timer-pulse' 
          : 'bg-card hover:bg-secondary/50'
      )}
    >
      {/* Count badge */}
      {todayCount > 0 && (
        <div className="absolute top-2 right-2 bg-muted text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-full">
          x{todayCount}
        </div>
      )}
      
      {/* Streak badge */}
      {streakDays >= 3 && (
        <div className="absolute top-2 left-2 text-xs">
          🔥 {streakDays}
        </div>
      )}
      
      {/* Icon */}
      <div className="text-5xl mb-2 transition-transform">
        {activity.icon}
      </div>
      
      {/* Name */}
      <p className="text-sm font-medium text-foreground truncate max-w-full px-2">
        {activity.name}
      </p>
      
      {/* Timer */}
      <div className={cn(
        'mt-2 font-mono text-sm transition-all',
        isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
      )}>
        {isActive ? formatTime(elapsedTime) : '00:00'}
      </div>
      
      {/* Active indicator */}
      {isActive && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full"
        />
      )}
    </motion.button>
  );
}
