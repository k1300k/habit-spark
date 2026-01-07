import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ActivityColor } from '@/lib/iconMapping';

export interface Activity {
  id: string;
  name: string;
  icon: string; // icon key
  color: ActivityColor;
  totalCount: number;
  totalDuration: number; // seconds
  createdAt: number;
  notificationEnabled: boolean;
}

export interface Session {
  id: string;
  activityId: string;
  date: string; // YYYY-MM-DD
  startTime: number;
  endTime: number | null;
  duration: number; // seconds
}

interface ActiveTimer {
  activityId: string;
  startTime: number;
}

interface ExportData {
  version: string;
  exportedAt: string;
  activities: Activity[];
  sessions: Session[];
}

interface ActivityState {
  activities: Activity[];
  sessions: Session[];
  activeTimers: ActiveTimer[];
  
  // Actions
  addActivity: (activity: Omit<Activity, 'id' | 'totalCount' | 'totalDuration' | 'createdAt' | 'notificationEnabled'>) => void;
  removeActivity: (id: string) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  
  startTimer: (activityId: string) => void;
  stopTimer: (activityId: string) => void;
  isTimerActive: (activityId: string) => boolean;
  getActiveTimerCount: () => number;
  
  getTodaySessions: (activityId: string) => Session[];
  getTodayCount: (activityId: string) => number;
  getStreakDays: (activityId: string) => number;
  
  // Import/Export
  exportData: () => ExportData;
  importData: (data: ExportData) => boolean;
  clearAllData: () => void;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      activities: [],
      sessions: [],
      activeTimers: [],

      addActivity: (activity) => {
        const newActivity: Activity = {
          ...activity,
          id: generateId(),
          totalCount: 0,
          totalDuration: 0,
          createdAt: Date.now(),
          notificationEnabled: true,
        };
        set((state) => ({
          activities: [...state.activities, newActivity],
        }));
      },

      removeActivity: (id) => {
        set((state) => ({
          activities: state.activities.filter((a) => a.id !== id),
          sessions: state.sessions.filter((s) => s.activityId !== id),
        }));
      },

      updateActivity: (id, updates) => {
        set((state) => ({
          activities: state.activities.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        }));
      },

      startTimer: (activityId) => {
        const { activeTimers } = get();
        const existingTimer = activeTimers.find(t => t.activityId === activityId);
        
        // If there's already an active timer for this activity, stop it
        if (existingTimer) {
          const duration = Math.floor((Date.now() - existingTimer.startTime) / 1000);
          const session: Session = {
            id: generateId(),
            activityId,
            date: getToday(),
            startTime: existingTimer.startTime,
            endTime: Date.now(),
            duration,
          };
          
          set((state) => ({
            sessions: [...state.sessions, session],
            activities: state.activities.map((a) =>
              a.id === activityId
                ? { ...a, totalCount: a.totalCount + 1, totalDuration: a.totalDuration + duration }
                : a
            ),
            activeTimers: state.activeTimers.filter(t => t.activityId !== activityId),
          }));
          return;
        }
        
        // Start new timer (병행 작업 가능 - 기존 타이머 유지)
        set((state) => ({
          activeTimers: [...state.activeTimers, { activityId, startTime: Date.now() }],
        }));
      },

      stopTimer: (activityId) => {
        const { activeTimers } = get();
        const timer = activeTimers.find(t => t.activityId === activityId);
        
        if (timer) {
          const duration = Math.floor((Date.now() - timer.startTime) / 1000);
          const session: Session = {
            id: generateId(),
            activityId,
            date: getToday(),
            startTime: timer.startTime,
            endTime: Date.now(),
            duration,
          };
          
          set((state) => ({
            sessions: [...state.sessions, session],
            activities: state.activities.map((a) =>
              a.id === activityId
                ? { ...a, totalCount: a.totalCount + 1, totalDuration: a.totalDuration + duration }
                : a
            ),
            activeTimers: state.activeTimers.filter(t => t.activityId !== activityId),
          }));
        }
      },

      isTimerActive: (activityId) => {
        return get().activeTimers.some(t => t.activityId === activityId);
      },

      getActiveTimerCount: () => {
        return get().activeTimers.length;
      },

      getTodaySessions: (activityId) => {
        const today = getToday();
        return get().sessions.filter(
          (s) => s.activityId === activityId && s.date === today
        );
      },

      getTodayCount: (activityId) => {
        return get().getTodaySessions(activityId).length;
      },

      getStreakDays: (activityId) => {
        const sessions = get().sessions.filter((s) => s.activityId === activityId);
        if (sessions.length === 0) return 0;

        const today = new Date();
        let streak = 0;
        let currentDate = new Date(today);

        while (true) {
          const dateStr = getDateString(currentDate);
          const hasSession = sessions.some((s) => s.date === dateStr);
          
          if (hasSession) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
          } else {
            break;
          }
        }

        return streak;
      },

      exportData: () => {
        const { activities, sessions } = get();
        return {
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          activities,
          sessions,
        };
      },

      importData: (data) => {
        try {
          if (!data.activities || !data.sessions) {
            return false;
          }
          
          set({
            activities: data.activities,
            sessions: data.sessions,
            activeTimers: [],
          });
          
          return true;
        } catch {
          return false;
        }
      },

      clearAllData: () => {
        set({
          activities: [],
          sessions: [],
          activeTimers: [],
        });
      },
    }),
    {
      name: 'how-ofter-storage',
    }
  )
);

// Initialize with sample data if empty
const initializeSampleData = () => {
  const store = useActivityStore.getState();
  if (store.activities.length === 0) {
    store.addActivity({ name: '달리기', icon: 'running', color: 'gray' });
    store.addActivity({ name: '독서', icon: 'reading', color: 'gray' });
    store.addActivity({ name: '물마시기', icon: 'water', color: 'gray' });
    store.addActivity({ name: '명상', icon: 'meditation', color: 'gray' });
  }
};

// Call on import
if (typeof window !== 'undefined') {
  initializeSampleData();
}
