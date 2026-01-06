import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Download, Upload, Bell, Info, AlertTriangle } from 'lucide-react';
import { useActivityStore } from '@/store/useActivityStore';
import { getIconComponent } from '@/lib/iconMapping';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
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
  const { activities, removeActivity, exportData, importData, clearAllData } = useActivityStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `how-ofter-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "내보내기 완료",
      description: "데이터가 JSON 파일로 저장되었습니다.",
    });
  };
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        const success = importData(data);
        
        if (success) {
          toast({
            title: "불러오기 완료",
            description: `${data.activities?.length || 0}개의 활동을 불러왔습니다.`,
          });
        } else {
          toast({
            title: "불러오기 실패",
            description: "올바른 형식의 파일이 아닙니다.",
            variant: "destructive",
          });
        }
      } catch {
        toast({
          title: "불러오기 실패",
          description: "파일을 읽는 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    
    // Reset input
    e.target.value = '';
  };
  
  return (
    <div className="p-4 pb-24 animate-fade-in-up">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
      
      {/* Data Management */}
      <div className="bg-card rounded-2xl p-4 shadow-card mb-4">
        <h3 className="font-medium text-foreground mb-3">데이터 관리</h3>
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-11"
            onClick={handleExport}
          >
            <Download className="w-5 h-5" />
            JSON 내보내기
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-11"
            onClick={handleImportClick}
          >
            <Upload className="w-5 h-5" />
            JSON 불러오기
          </Button>
        </div>
      </div>
      
      {/* Activity Management */}
      <div className="bg-card rounded-2xl p-4 shadow-card mb-4">
        <h3 className="font-medium text-foreground mb-3">활동 관리</h3>
        <div className="space-y-1">
          {activities.map((activity) => {
            const IconComponent = getIconComponent(activity.icon);
            return (
              <div
                key={activity.id}
                className="flex items-center justify-between py-2.5"
              >
                <div className="flex items-center gap-3">
                  <IconComponent size={22} strokeWidth={1.5} className="text-foreground" />
                  <span className="text-foreground text-sm">{activity.name}</span>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-[90vw] rounded-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>활동 삭제</AlertDialogTitle>
                      <AlertDialogDescription>
                        "{activity.name}" 활동과 모든 기록을 삭제하시겠습니까?
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
            );
          })}
          
          {activities.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              등록된 활동이 없습니다
            </p>
          )}
        </div>
      </div>
      
      {/* Danger Zone */}
      <div className="bg-card rounded-2xl p-4 shadow-card mb-4 border border-destructive/20">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <h3 className="font-medium text-foreground">위험 구역</h3>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-11 border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-5 h-5" />
              모든 데이터 삭제
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-[90vw] rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>모든 데이터 삭제</AlertDialogTitle>
              <AlertDialogDescription>
                모든 활동과 기록이 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={clearAllData}
                className="bg-destructive hover:bg-destructive/90"
              >
                모두 삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      {/* About */}
      <div className="bg-card rounded-2xl p-4 shadow-card">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
            <Info className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">How Ofter</p>
            <p className="text-xs text-muted-foreground">버전 1.0.0</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          일상의 활동을 간단하게 기록하고, 자연스러운 습관 형성을 돕는 미니멀 라이프로그 서비스입니다.
        </p>
      </div>
    </div>
  );
}
