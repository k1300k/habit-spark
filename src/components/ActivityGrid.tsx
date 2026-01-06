import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useActivityStore } from '@/store/useActivityStore';
import { ActivityCard } from './ActivityCard';

interface ActivityGridProps {
  onAddClick: () => void;
}

export function ActivityGrid({ onAddClick }: ActivityGridProps) {
  const activities = useActivityStore((state) => state.activities);
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 stagger-children">
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activityId={activity.id} />
      ))}
      
      {/* Add Activity Button */}
      <motion.button
        onClick={onAddClick}
        whileTap={{ scale: 0.95 }}
        className="flex flex-col items-center justify-center min-h-[120px] sm:min-h-[140px] rounded-2xl border-2 border-dashed border-border active:border-foreground active:bg-muted/30 transition-all"
      >
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
          <Plus className="w-5 h-5 text-muted-foreground" />
        </div>
        <span className="text-xs text-muted-foreground">
          활동 추가
        </span>
      </motion.button>
    </div>
  );
}
