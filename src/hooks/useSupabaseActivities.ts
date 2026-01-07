import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ActivityColor } from '@/lib/iconMapping';

export interface Activity {
  id: string;
  name: string;
  icon: string;
  color: ActivityColor;
  totalCount: number;
  totalDuration: number;
  createdAt: number;
  notificationEnabled: boolean;
}

export interface Session {
  id: string;
  activityId: string;
  date: string;
  startTime: number;
  endTime: number | null;
  duration: number;
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

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function useSupabaseActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeTimers, setActiveTimers] = useState<ActiveTimer[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from Supabase
  const loadData = useCallback(async () => {
    try {
      // Load activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: true });

      if (activitiesError) throw activitiesError;

      // Load sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Load active timers
      const { data: timersData, error: timersError } = await supabase
        .from('active_timers')
        .select('*');

      if (timersError) throw timersError;

      // Map to local format
      const mappedActivities: Activity[] = (activitiesData || []).map((a) => ({
        id: a.id,
        name: a.name,
        icon: a.icon,
        color: a.color as ActivityColor,
        totalCount: a.count,
        totalDuration: 0, // Will calculate from sessions
        createdAt: new Date(a.created_at).getTime(),
        notificationEnabled: true,
      }));

      const mappedSessions: Session[] = (sessionsData || []).map((s) => ({
        id: s.id,
        activityId: s.activity_id,
        date: new Date(s.created_at).toISOString().split('T')[0],
        startTime: s.start_time,
        endTime: s.end_time,
        duration: s.duration,
      }));

      // Calculate total duration for each activity
      mappedActivities.forEach((activity) => {
        const activitySessions = mappedSessions.filter(
          (s) => s.activityId === activity.id
        );
        activity.totalDuration = activitySessions.reduce(
          (sum, s) => sum + s.duration,
          0
        );
      });

      const mappedTimers: ActiveTimer[] = (timersData || []).map((t) => ({
        activityId: t.activity_id,
        startTime: t.start_time,
      }));

      setActivities(mappedActivities);
      setSessions(mappedSessions);
      setActiveTimers(mappedTimers);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Add activity
  const addActivity = async (
    activity: Omit<Activity, 'id' | 'totalCount' | 'totalDuration' | 'createdAt' | 'notificationEnabled'>
  ) => {
    const { data, error } = await supabase
      .from('activities')
      .insert({
        name: activity.name,
        icon: activity.icon,
        color: activity.color,
        count: 0,
        today_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding activity:', error);
      return;
    }

    const newActivity: Activity = {
      id: data.id,
      name: data.name,
      icon: data.icon,
      color: data.color as ActivityColor,
      totalCount: 0,
      totalDuration: 0,
      createdAt: new Date(data.created_at).getTime(),
      notificationEnabled: true,
    };

    setActivities((prev) => [...prev, newActivity]);
  };

  // Remove activity
  const removeActivity = async (id: string) => {
    const { error } = await supabase.from('activities').delete().eq('id', id);

    if (error) {
      console.error('Error removing activity:', error);
      return;
    }

    setActivities((prev) => prev.filter((a) => a.id !== id));
    setSessions((prev) => prev.filter((s) => s.activityId !== id));
    setActiveTimers((prev) => prev.filter((t) => t.activityId !== id));
  };

  // Update activity
  const updateActivity = async (id: string, updates: Partial<Activity>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.totalCount !== undefined) dbUpdates.count = updates.totalCount;

    const { error } = await supabase
      .from('activities')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating activity:', error);
      return;
    }

    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  };

  // Start timer
  const startTimer = async (activityId: string) => {
    const existingTimer = activeTimers.find((t) => t.activityId === activityId);

    if (existingTimer) {
      // Stop existing timer
      await stopTimer(activityId);
      return;
    }

    // Start new timer
    const startTime = Date.now();
    const { error } = await supabase.from('active_timers').insert({
      activity_id: activityId,
      start_time: startTime,
    });

    if (error) {
      console.error('Error starting timer:', error);
      return;
    }

    setActiveTimers((prev) => [...prev, { activityId, startTime }]);
  };

  // Stop timer
  const stopTimer = async (activityId: string) => {
    const timer = activeTimers.find((t) => t.activityId === activityId);

    if (!timer) return;

    const endTime = Date.now();
    const duration = Math.floor((endTime - timer.startTime) / 1000);

    // Delete active timer
    await supabase
      .from('active_timers')
      .delete()
      .eq('activity_id', activityId);

    // Create session
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        activity_id: activityId,
        start_time: timer.startTime,
        end_time: endTime,
        duration: duration,
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      return;
    }

    // Update activity count
    const activity = activities.find((a) => a.id === activityId);
    if (activity) {
      await supabase
        .from('activities')
        .update({ count: activity.totalCount + 1 })
        .eq('id', activityId);
    }

    // Update local state
    setActiveTimers((prev) => prev.filter((t) => t.activityId !== activityId));

    const newSession: Session = {
      id: sessionData.id,
      activityId,
      date: getToday(),
      startTime: timer.startTime,
      endTime,
      duration,
    };
    setSessions((prev) => [newSession, ...prev]);

    setActivities((prev) =>
      prev.map((a) =>
        a.id === activityId
          ? {
              ...a,
              totalCount: a.totalCount + 1,
              totalDuration: a.totalDuration + duration,
            }
          : a
      )
    );
  };

  // Check if timer is active
  const isTimerActive = (activityId: string) => {
    return activeTimers.some((t) => t.activityId === activityId);
  };

  // Get active timer count
  const getActiveTimerCount = () => {
    return activeTimers.length;
  };

  // Get today's sessions
  const getTodaySessions = (activityId: string) => {
    const today = getToday();
    return sessions.filter(
      (s) => s.activityId === activityId && s.date === today
    );
  };

  // Get today's count
  const getTodayCount = (activityId: string) => {
    return getTodaySessions(activityId).length;
  };

  // Get streak days
  const getStreakDays = (activityId: string) => {
    const activitySessions = sessions.filter((s) => s.activityId === activityId);
    if (activitySessions.length === 0) return 0;

    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);

    while (true) {
      const dateStr = getDateString(currentDate);
      const hasSession = activitySessions.some((s) => s.date === dateStr);

      if (hasSession) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  // Export data
  const exportData = (): ExportData => {
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      activities,
      sessions,
    };
  };

  // Import data
  const importData = async (data: ExportData): Promise<boolean> => {
    try {
      if (!data.activities || !data.sessions) {
        return false;
      }

      // Clear existing data
      await supabase.from('active_timers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('activities').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Import activities
      for (const activity of data.activities) {
        await supabase.from('activities').insert({
          name: activity.name,
          icon: activity.icon,
          color: activity.color,
          count: activity.totalCount,
          today_count: 0,
        });
      }

      // Reload data
      await loadData();
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  };

  // Clear all data
  const clearAllData = async () => {
    await supabase.from('active_timers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('activities').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    setActivities([]);
    setSessions([]);
    setActiveTimers([]);
  };

  return {
    activities,
    sessions,
    activeTimers,
    loading,
    addActivity,
    removeActivity,
    updateActivity,
    startTimer,
    stopTimer,
    isTimerActive,
    getActiveTimerCount,
    getTodaySessions,
    getTodayCount,
    getStreakDays,
    exportData,
    importData,
    clearAllData,
    refreshData: loadData,
  };
}
