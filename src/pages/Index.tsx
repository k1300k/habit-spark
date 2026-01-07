import { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ActivityGrid } from '@/components/ActivityGrid';
import { AddActivityModal } from '@/components/AddActivityModal';
import { Dashboard } from '@/components/Dashboard';
import { SettingsPanel } from '@/components/SettingsPanel';
import { ActivityProvider } from '@/contexts/ActivityContext';

type Tab = 'home' | 'dashboard' | 'settings';

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  return (
    <ActivityProvider>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pb-20">
          {activeTab === 'home' && (
            <ActivityGrid onAddClick={() => setIsAddModalOpen(true)} />
          )}
          
          {activeTab === 'dashboard' && (
            <Dashboard />
          )}
          
          {activeTab === 'settings' && (
            <SettingsPanel />
          )}
        </main>
        
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        
        <AddActivityModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      </div>
    </ActivityProvider>
  );
};

export default Index;
