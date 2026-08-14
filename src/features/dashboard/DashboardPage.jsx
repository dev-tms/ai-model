import { History, MessageSquare, PhoneCall, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export const DashboardPage = ({ onOpenAssistant }) => {
  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-900 px-6 py-8 text-white sm:px-8">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">
            <Sparkles size={14} />
            Praangan Elitus
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            Real-time performance overview for your AI voice workflow. Open the assistant or review
            recent customer conversations.
          </p>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
          <button
            type="button"
            onClick={() => onOpenAssistant("chat")}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:border-slate-300 hover:bg-white hover:shadow-sm"
          >
            <MessageSquare size={20} className="text-blue-600" />
            <p className="mt-3 font-semibold text-slate-950">Chat with AI</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Ask questions about the Praangan Elitus project in text.
            </p>
          </button>
          <button
            type="button"
            onClick={() => onOpenAssistant("call")}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:border-slate-300 hover:bg-white hover:shadow-sm"
          >
            <PhoneCall size={20} className="text-blue-600" />
            <p className="mt-3 font-semibold text-slate-950">Voice call</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Speak with the assistant and get automatic replies after each pause.
            </p>
          </button>
          <Link
            to="/conversations"
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 hover:bg-white hover:shadow-sm"
          >
            <History size={20} className="text-blue-600" />
            <p className="mt-3 font-semibold text-slate-950">Conversations</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Review leads, customer profiles, and session transcripts.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};
