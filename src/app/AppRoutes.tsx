import { AppLayout } from './AppLayout';
import { useAppRoute } from './useAppRoute';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { AgentsPage } from '../pages/AgentsPage';

type AppRoutesProps = {
  onOpenAssistant: (mode: 'chat' | 'call') => void;
};

export const AppRoutes = ({ onOpenAssistant }: AppRoutesProps) => {
  const { route, navigate } = useAppRoute();

  const renderPage = () => {
    switch (route.id) {
      case 'dashboard':
        return <DashboardPage onOpenAssistant={onOpenAssistant} />;
      case 'conversations':
        return <AgentsPage />;
      default:
        return <DashboardPage onOpenAssistant={onOpenAssistant} />;
    }
  };

  return (
    <AppLayout activeRouteId={route.id} onNavigate={navigate}>
      {renderPage()}
    </AppLayout>
  );
};
