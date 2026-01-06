import { Settings } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between px-4 h-12">
        <h1 className="text-lg font-bold text-foreground tracking-tight">
          How Ofter
        </h1>
      </div>
    </header>
  );
}
