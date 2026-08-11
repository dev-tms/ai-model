import { ReactNode, useState } from 'react';
import { Menu } from 'lucide-react';
import { SidebarNav } from '../shared/navigation/SidebarNav';
import { AppRouteId, appRoutes } from './routes';

type AppLayoutProps = {
  activeRouteId: AppRouteId;
  children: ReactNode;
  onNavigate: (path: string) => void;
};

export const AppLayout = ({ activeRouteId, children, onNavigate }: AppLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleNavigate = (path: string) => {
    onNavigate(path);
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 lg:flex lg:h-screen lg:overflow-hidden">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            PE
          </div>
          <span className="font-bold tracking-tight text-slate-950">Praangan Elitus</span>
        </div>
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
      </header>

      <SidebarNav
        activeRouteId={activeRouteId}
        isOpen={isSidebarOpen}
        routes={appRoutes}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={handleNavigate}
      />

      <main className="min-w-0 flex-1 lg:overflow-y-auto">{children}</main>
    </div>
  );
};
