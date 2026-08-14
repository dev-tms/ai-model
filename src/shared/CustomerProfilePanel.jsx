import { CalendarClock, Mail, Phone, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import {
  avatarColorFor,
  conversationDetailPath,
  formatDate,
  getCustomerName,
  getLeadScore,
  getLeadScoreClass,
  initialsFor,
  languageLabel,
} from "../lib/conversation";

const ProfileField = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4">
    <dt className="text-slate-500">{label}</dt>
    <dd className="min-w-0 text-right font-semibold text-slate-900">
      {value || "—"}
    </dd>
  </div>
);

export const CustomerProfilePanel = ({
  conversation,
  showOpenDetails = true,
}) => {
  if (!conversation) {
    return (
      <div className="p-10 text-center">
        <p className="text-sm font-semibold text-slate-700">Select a conversation</p>
        <p className="mt-1 text-xs text-slate-500">Details will appear here.</p>
      </div>
    );
  }

  const customer = conversation.customer;
  const score = getLeadScore(conversation);
  const detailPath = conversationDetailPath(conversation.session_id);

  return (
    <div>
      <div className="border-b border-slate-200 p-4 xl:p-5">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-semibold ${
              customer ? avatarColorFor(customer.name) : "bg-slate-100 text-slate-500"
            }`}
          >
            {customer ? initialsFor(customer.name) : <UserRound size={21} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold text-slate-950">
              {getCustomerName(conversation)}
            </p>
            <p className="mt-1 truncate text-sm text-slate-500">
              {customer?.profession || "Profile not yet captured"}
            </p>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getLeadScoreClass(score)}`}
          >
            {score}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <a
            href={customer?.phone ? `tel:${customer.phone}` : undefined}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition ${
              customer?.phone
                ? "bg-slate-950 text-white hover:bg-slate-800"
                : "pointer-events-none bg-slate-100 text-slate-400"
            }`}
          >
            <Phone size={16} />
            Call
          </a>
          <a
            href={customer?.email ? `mailto:${customer.email}` : undefined}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition ${
              customer?.email
                ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                : "pointer-events-none border-slate-200 bg-slate-50 text-slate-400"
            }`}
          >
            <Mail size={16} />
            Email
          </a>
        </div>
      </div>

      <div className="space-y-5 p-4 xl:p-5">
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Session summary
            </p>
            {showOpenDetails && (
              <Link
                to={detailPath}
                state={{ summary: conversation }}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Open details
              </Link>
            )}
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {conversation.summary || "No summary captured for this session."}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <CalendarClock size={14} />
              Started
            </dt>
            <dd className="mt-1 font-semibold text-slate-950">
              {formatDate(conversation.started_at)}
            </dd>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-xs font-medium text-slate-500">Language</dt>
            <dd className="mt-1 font-semibold text-slate-950">
              {languageLabel(conversation.language)}
            </dd>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-xs font-medium text-slate-500">Turns</dt>
            <dd className="mt-1 font-semibold tabular-nums text-slate-950">
              {conversation.turn_count ?? 0}
            </dd>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-xs font-medium text-slate-500">Session ID</dt>
            <dd className="mt-1 truncate font-mono text-xs font-semibold text-slate-950">
              {conversation.session_id || "—"}
            </dd>
          </div>
        </dl>

        {customer ? (
          <dl className="space-y-3 border-t border-slate-100 pt-5 text-sm">
            <ProfileField label="Phone" value={customer.phone} />
            <ProfileField label="Email" value={customer.email || "Not shared"} />
            <ProfileField label="Profession" value={customer.profession} />
            <ProfileField label="Budget" value={customer.budget_range} />
            <ProfileField label="Family size" value={customer.family_size} />
            <ProfileField label="Source" value={customer.source} />
          </dl>
        ) : (
          <div className="rounded-lg border border-dashed border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-800">Profile missing</p>
            <p className="mt-1 text-sm leading-6 text-amber-700">
              The conversation has not been matched to a customer record yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
