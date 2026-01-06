import { Settings } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⏱️</span>
          <h1 className="text-xl font-bold text-foreground">
            How Ofter
          </h1>
        </div>
        
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted">
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
}
