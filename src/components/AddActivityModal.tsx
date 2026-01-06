import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useActivityStore } from '@/store/useActivityStore';
import { getIconForActivity, activityColors, ActivityColor } from '@/lib/iconMapping';
import { cn } from '@/lib/utils';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddActivityModal({ isOpen, onClose }: AddActivityModalProps) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState<ActivityColor>('blue');
  const [previewIcon, setPreviewIcon] = useState('🎯');
  const addActivity = useActivityStore((state) => state.addActivity);
  
  useEffect(() => {
    if (name) {
      setPreviewIcon(getIconForActivity(name));
    } else {
      setPreviewIcon('🎯');
    }
  }, [name]);
  
  const handleSubmit = () => {
    if (!name.trim()) return;
    
    addActivity({
      name: name.trim(),
      icon: previewIcon,
      color: selectedColor,
    });
    
    setName('');
    setSelectedColor('blue');
    onClose();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };
  
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
            className="fixed bottom-0 left-0 right-0 bg-background rounded-t-3xl p-6 pb-8 z-50 safe-bottom"
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-6" />
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>
            
            {/* Title */}
            <h2 className="text-xl font-semibold text-center mb-6">
              새로운 활동 추가
            </h2>
            
            {/* Icon Preview */}
            <div className="flex justify-center mb-6">
              <motion.div
                key={previewIcon}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 bg-card rounded-2xl flex items-center justify-center text-5xl shadow-card"
              >
                {previewIcon}
              </motion.div>
            </div>
            
            {/* Input */}
            <div className="mb-6">
              <Input
                placeholder="활동 이름을 입력하세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={20}
                className="text-center text-lg h-14 rounded-xl border-2 border-border focus:border-primary transition-colors"
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-center mt-2">
                💡 예: 독서, 운동, 물마시기
              </p>
            </div>
            
            {/* Color Selection */}
            <div className="mb-8">
              <p className="text-sm text-muted-foreground text-center mb-3">색상 선택</p>
              <div className="flex justify-center gap-4">
                {activityColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={cn(
                      'w-10 h-10 rounded-full transition-all',
                      selectedColor === color.name 
                        ? 'ring-2 ring-offset-2 ring-foreground scale-110' 
                        : 'hover:scale-105'
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
              className="w-full h-14 rounded-xl text-lg font-semibold shadow-button"
            >
              추가하기
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
