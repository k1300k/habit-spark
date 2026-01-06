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

interface CurrentTimer {
  activityId: string | null;
  startTime: number | null;
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
  currentTimer: CurrentTimer;
  
  // Actions
  addActivity: (activity: Omit<Activity, 'id' | 'totalCount' | 'totalDuration' | 'createdAt' | 'notificationEnabled'>) => void;
  removeActivity: (id: string) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  
  startTimer: (activityId: string) => void;
  stopTimer: () => void;
  
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
      currentTimer: { activityId: null, startTime: null },

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
        const { currentTimer } = get();
        
        // If there's already an active timer for this activity, stop it
        if (currentTimer.activityId === activityId && currentTimer.startTime) {
          const duration = Math.floor((Date.now() - currentTimer.startTime) / 1000);
          const session: Session = {
            id: generateId(),
            activityId,
            date: getToday(),
            startTime: currentTimer.startTime,
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
            currentTimer: { activityId: null, startTime: null },
          }));
          return;
        }
        
        // Stop any other running timer first
        if (currentTimer.activityId && currentTimer.startTime) {
          const duration = Math.floor((Date.now() - currentTimer.startTime) / 1000);
          const session: Session = {
            id: generateId(),
            activityId: currentTimer.activityId,
            date: getToday(),
            startTime: currentTimer.startTime,
            endTime: Date.now(),
            duration,
          };
          
          set((state) => ({
            sessions: [...state.sessions, session],
            activities: state.activities.map((a) =>
              a.id === currentTimer.activityId
                ? { ...a, totalCount: a.totalCount + 1, totalDuration: a.totalDuration + duration }
                : a
            ),
          }));
        }
        
        // Start new timer
        set({ currentTimer: { activityId, startTime: Date.now() } });
      },

      stopTimer: () => {
        const { currentTimer } = get();
        if (currentTimer.activityId && currentTimer.startTime) {
          const duration = Math.floor((Date.now() - currentTimer.startTime) / 1000);
          const session: Session = {
            id: generateId(),
            activityId: currentTimer.activityId,
            date: getToday(),
            startTime: currentTimer.startTime,
            endTime: Date.now(),
            duration,
          };
          
          set((state) => ({
            sessions: [...state.sessions, session],
            activities: state.activities.map((a) =>
              a.id === currentTimer.activityId
                ? { ...a, totalCount: a.totalCount + 1, totalDuration: a.totalDuration + duration }
                : a
            ),
            currentTimer: { activityId: null, startTime: null },
          }));
        }
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
            currentTimer: { activityId: null, startTime: null },
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
          currentTimer: { activityId: null, startTime: null },
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
