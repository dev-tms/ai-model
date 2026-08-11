type DashboardPageProps = {
  onOpenAssistant: (mode: 'chat' | 'call') => void;
};

export const DashboardPage = ({ onOpenAssistant }: DashboardPageProps) => {
  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Real-time performance overview for your AI voice workflow.
        </p>
        <button
          type="button"
          onClick={() => onOpenAssistant('chat')}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Open Assistant
        </button>
      </div>
    </div>
  );
};
