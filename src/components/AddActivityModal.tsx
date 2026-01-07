import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useActivities } from '@/contexts/ActivityContext';
import { getIconForActivity, getIconComponent, activityColors, ActivityColor } from '@/lib/iconMapping';
import { cn } from '@/lib/utils';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddActivityModal({ isOpen, onClose }: AddActivityModalProps) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState<ActivityColor>('gray');
  const [previewIconKey, setPreviewIconKey] = useState('default');
  const { addActivity } = useActivities();
  
  useEffect(() => {
    if (name) {
      setPreviewIconKey(getIconForActivity(name));
    } else {
      setPreviewIconKey('default');
    }
  }, [name]);
  
  const handleSubmit = async () => {
    if (!name.trim()) return;
    
    await addActivity({
      name: name.trim(),
      icon: previewIconKey,
      color: selectedColor,
    });
    
    setName('');
    setSelectedColor('gray');
    onClose();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };
  
  const PreviewIcon = getIconComponent(previewIconKey);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-background rounded-t-3xl p-5 pb-8 z-50 safe-bottom max-h-[85vh] overflow-y-auto"
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-5" />
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>
            
            {/* Title */}
            <h2 className="text-lg font-semibold text-center mb-5">
              새로운 활동 추가
            </h2>
            
            {/* Icon Preview */}
            <div className="flex justify-center mb-5">
              <motion.div
                key={previewIconKey}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 bg-card rounded-2xl flex items-center justify-center shadow-card"
              >
                <PreviewIcon size={32} strokeWidth={1.5} className="text-foreground" />
              </motion.div>
            </div>
            
            {/* Input */}
            <div className="mb-5">
              <Input
                placeholder="활동 이름을 입력하세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={20}
                className="text-center text-base h-12 rounded-xl border-2 border-border focus:border-primary transition-colors"
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-center mt-2">
                예: 독서, 운동, 물마시기
              </p>
            </div>
            
            {/* Color Selection */}
            <div className="mb-6">
              <p className="text-xs text-muted-foreground text-center mb-3">색상 선택</p>
              <div className="flex justify-center gap-3">
                {activityColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={cn(
                      'w-9 h-9 rounded-full transition-all',
                      selectedColor === color.name 
                        ? 'ring-2 ring-offset-2 ring-foreground scale-110' 
                        : 'active:scale-95'
                    )}
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>
            </div>
            
            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!name.trim()}
              className="w-full h-12 rounded-xl text-base font-semibold"
            >
              추가하기
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
