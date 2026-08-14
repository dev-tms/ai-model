import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Mail, Phone, UserRound } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  avatarColorFor,
  formatDate,
  getLeadScoreClass,
  getLeadScoreFromTurns,
  initialsFor,
  languageLabel,
} from "../lib/conversation";

const ConversationDetail = () => {
  const { project_id, session_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const listingSummary = location.state?.summary || null;

  const [data, setData] = useState(null);
  const [listingFallback, setListingFallback] = useState(listingSummary);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!project_id || !session_id) return;

    const ctrl = new AbortController();
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `https://192.168.40.20:8000/customers/${project_id}/conversation/${session_id}`,
          { signal: ctrl.signal },
        );
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
        setData(await res.json());
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message || "Failed");
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => ctrl.abort();
  }, [project_id, session_id]);

  useEffect(() => {
    if (listingSummary || !project_id || !session_id) return;

    const ctrl = new AbortController();
    const loadSummary = async () => {
      try {
        const res = await fetch(
          `https://192.168.40.20:8000/customers/${project_id}/summaries`,
          { signal: ctrl.signal },
        );
        if (!res.ok) return;
        const json = await res.json();
        const match = (json.summaries || []).find((item) => item.session_id === session_id);
        if (match) setListingFallback(match);
      } catch {
        // Listing fallback is optional.
      }
    };

    loadSummary();
    return () => ctrl.abort();
  }, [listingSummary, project_id, session_id]);

  const customer = data?.customer || listingFallback?.customer || null;
  const turnCount = data?.turn_count ?? listingFallback?.turn_count ?? 0;
  const score = getLeadScoreFromTurns(turnCount, Boolean(customer));
  const summaryText = listingFallback?.summary || data?.summary || "";
  const language = data?.language || listingFallback?.language;
  const startedAt = data?.started_at || listingFallback?.started_at;
  const sessionId = data?.session_id || listingFallback?.session_id || session_id;
  const turns = Array.isArray(data?.turns) ? data.turns : [];

  const profileFields = useMemo(
    () => [
      ["Phone", customer?.phone],
      ["Email", customer?.email || (customer ? "Not shared" : null)],
      ["Profession", customer?.profession],
      ["Budget", customer?.budget_range],
      ["Family size", customer?.family_size],
      ["Source", customer?.source],
    ],
    [customer],
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => navigate("/conversations")}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            <ChevronRight size={16} className="-rotate-180" />
            Back to conversations
          </button>
          <h1 className="mt-3 text-2xl font-bold text-slate-950">Conversation details</h1>
          <p className="mt-1 truncate text-sm text-slate-500">Session {sessionId}</p>
        </div>
        <div className="text-sm text-slate-500 sm:text-right">
          {startedAt && <div>Started {formatDate(startedAt)}</div>}
          {data?.ended_at && <div className="mt-1">Ended {formatDate(data.ended_at)}</div>}
        </div>
      </div>

      {loading && !listingFallback ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
          Loading conversation…
        </div>
      ) : error && !listingFallback ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {error}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold ${
                    customer ? avatarColorFor(customer.name) : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {customer ? initialsFor(customer.name) : <UserRound size={24} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold text-slate-900">
                        {customer?.name || "Unknown visitor"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {customer?.profession || "Profile not yet captured"}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getLeadScoreClass(score)}`}
                    >
                      {score}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href={customer?.phone ? `tel:${customer.phone}` : undefined}
                      className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition ${
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
                      className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition ${
                        customer?.email
                          ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          : "pointer-events-none border border-slate-200 bg-slate-50 text-slate-400"
                      }`}
                    >
                      <Mail size={16} />
                      Email
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {summaryText && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Session summary
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-700">{summaryText}</p>
              </section>
            )}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-slate-700">Transcript</h2>
                {loading && (
                  <span className="text-xs text-slate-400">Refreshing transcript…</span>
                )}
              </div>
              {error && listingFallback && (
                <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  Transcript could not be loaded: {error}
                </p>
              )}
              <div className="mt-4 space-y-4">
                {turns.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    {loading
                      ? "Loading transcript…"
                      : "No transcript turns are available yet."}
                  </p>
                ) : (
                  turns.map((turn, idx) => (
                    <div key={`${turn.timestamp || "turn"}-${idx}`} className="flex gap-3">
                      <div className="hidden w-36 shrink-0 text-xs text-slate-500 sm:block">
                        {formatDate(turn.timestamp)}
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <p className="text-xs text-slate-400 sm:hidden">
                          {formatDate(turn.timestamp)}
                        </p>
                        {turn.user && (
                          <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-900">
                            <div className="text-xs font-semibold text-slate-600">User</div>
                            <div className="mt-1 leading-6">{turn.user}</div>
                          </div>
                        )}
                        {turn.assistant && (
                          <div className="rounded-2xl bg-blue-50 p-3 text-sm text-slate-900">
                            <div className="text-xs font-semibold text-slate-600">Assistant</div>
                            <div className="mt-1 leading-6">{turn.assistant}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {data?.raw_text && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-700">Raw transcript</h3>
                <pre className="mt-3 max-h-60 overflow-auto whitespace-pre-wrap text-sm text-slate-800">
                  {data.raw_text}
                </pre>
              </section>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Session info
              </h2>
              <dl className="mt-4 grid grid-cols-1 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-xs font-medium text-slate-500">Started</dt>
                  <dd className="mt-1 font-semibold text-slate-950">{formatDate(startedAt)}</dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-xs font-medium text-slate-500">Language</dt>
                  <dd className="mt-1 font-semibold text-slate-950">{languageLabel(language)}</dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-xs font-medium text-slate-500">Turns</dt>
                  <dd className="mt-1 font-semibold tabular-nums text-slate-950">{turnCount}</dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-xs font-medium text-slate-500">Session ID</dt>
                  <dd className="mt-1 break-all font-mono text-xs font-semibold text-slate-950">
                    {sessionId}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Customer profile
              </h2>
              {customer ? (
                <dl className="mt-4 space-y-3 text-sm">
                  {profileFields.map(([label, value]) => (
                    <div key={label} className="flex items-start justify-between gap-4">
                      <dt className="text-slate-500">{label}</dt>
                      <dd className="min-w-0 text-right font-semibold text-slate-900">
                        {value || "—"}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-800">Profile missing</p>
                  <p className="mt-1 text-sm leading-6 text-amber-700">
                    The conversation has not been matched to a customer record yet.
                  </p>
                </div>
              )}
            </section>
          </aside>
        </div>
      )}
    </div>
  );
};

export default ConversationDetail;
