import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Download, Upload, Bell, Info } from 'lucide-react';
import { useActivityStore } from '@/store/useActivityStore';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function SettingsPanel() {
  const { activities, removeActivity } = useActivityStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  const handleExport = () => {
    const data = {
      activities: useActivityStore.getState().activities,
      sessions: useActivityStore.getState().sessions,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `how-ofter-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
      }
    } else {
      setNotificationsEnabled(enabled);
    }
  };
  
  return (
    <div className="p-4 pb-24 animate-fade-in-up">
      {/* Notifications */}
      <div className="bg-card rounded-2xl p-4 shadow-card mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">알림</p>
              <p className="text-sm text-muted-foreground">습관 리마인더 받기</p>
            </div>
          </div>
          <Switch 
            checked={notificationsEnabled} 
            onCheckedChange={handleNotificationToggle}
          />
        </div>
      </div>
      
      {/* Data Management */}
      <div className="bg-card rounded-2xl p-4 shadow-card mb-4">
        <h3 className="font-medium text-foreground mb-3">데이터 관리</h3>
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12"
            onClick={handleExport}
          >
            <Download className="w-5 h-5" />
            데이터 내보내기
          </Button>
        </div>
      </div>
      
      {/* Activity Management */}
      <div className="bg-card rounded-2xl p-4 shadow-card mb-4">
        <h3 className="font-medium text-foreground mb-3">활동 관리</h3>
        <div className="space-y-2">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{activity.icon}</span>
                <span className="text-foreground">{activity.name}</span>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>활동 삭제</AlertDialogTitle>
                    <AlertDialogDescription>
                      "{activity.name}" 활동과 모든 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => removeActivity(activity.id)}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      삭제
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
          
          {activities.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              등록된 활동이 없습니다
            </p>
          )}
        </div>
      </div>
      
      {/* About */}
      <div className="bg-card rounded-2xl p-4 shadow-card">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
            <Info className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">How Ofter</p>
            <p className="text-sm text-muted-foreground">버전 1.0.0</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          일상의 활동을 간단하게 기록하고, 자연스러운 습관 형성을 돕는 미니멀 라이프로그 서비스입니다.
        </p>
      </div>
    </div>
  );
}
