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
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 stagger-children">
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activityId={activity.id} />
      ))}
      
      {/* Add Activity Button */}
      <motion.button
        onClick={onAddClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex flex-col items-center justify-center min-h-[140px] rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all group"
      >
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2 group-hover:bg-primary/10 transition-colors">
          <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
          활동 추가
        </span>
      </motion.button>
    </div>
  );
}
