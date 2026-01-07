import { createContext, useContext, ReactNode } from 'react';
import { useSupabaseActivities, Activity, Session } from '@/hooks/useSupabaseActivities';

export type { Activity, Session };

interface ActivityContextType {
  activities: Activity[];
  sessions: Session[];
  activeTimers: { activityId: string; startTime: number }[];
  loading: boolean;
  addActivity: (activity: Omit<Activity, 'id' | 'totalCount' | 'totalDuration' | 'createdAt' | 'notificationEnabled'>) => Promise<void>;
  removeActivity: (id: string) => Promise<void>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  startTimer: (activityId: string) => Promise<void>;
  stopTimer: (activityId: string) => Promise<void>;
  isTimerActive: (activityId: string) => boolean;
  getActiveTimerCount: () => number;
  getTodaySessions: (activityId: string) => Session[];
  getTodayCount: (activityId: string) => number;
  getStreakDays: (activityId: string) => number;
  exportData: () => { version: string; exportedAt: string; activities: Activity[]; sessions: Session[] };
  importData: (data: { version: string; exportedAt: string; activities: Activity[]; sessions: Session[] }) => Promise<boolean>;
  clearAllData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const ActivityContext = createContext<ActivityContextType | null>(null);

export function ActivityProvider({ children }: { children: ReactNode }) {
  const activityData = useSupabaseActivities();

  return (
    <ActivityContext.Provider value={activityData}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivities() {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivities must be used within an ActivityProvider');
  }
  return context;
}
