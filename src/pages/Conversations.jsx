import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  MessageSquareText,
  Search,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { CustomerProfilePanel } from "../shared/CustomerProfilePanel";
import {
  LANGUAGE_ACCENT,
  LANGUAGE_DOT,
  avatarColorFor,
  conversationDetailPath,
  formatDate,
  getCustomerName,
  getLeadScore,
  getLeadScoreClass,
  initialsFor,
  languageLabel,
  searchableText,
} from "../lib/conversation";

const PAGE_SIZE = 50;
const SUMMARIES_URL = "https://192.168.40.20:8000/customers/praangan/summaries";

const Conversations = () => {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [query, setQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [profileFilter, setProfileFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadSummaries = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(SUMMARIES_URL, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Failed to load summaries: ${response.status}`);
        }
        const data = await response.json();
        setSummaries(Array.isArray(data?.summaries) ? data.summaries : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to load summaries");
          setSummaries([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadSummaries();
    return () => controller.abort();
  }, []);

  const summaryStats = useMemo(
    () => ({
      totalSessions: summaries.length,
      withCustomer: summaries.filter((item) => item.customer).length,
      totalTurns: summaries.reduce((total, item) => total + (Number(item.turn_count) || 0), 0),
      hotLeads: summaries.filter((item) => getLeadScore(item) === "Hot").length,
    }),
    [summaries],
  );

  const filteredSummaries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return summaries.filter((item) => {
      const profileMatch =
        profileFilter === "all" ||
        (profileFilter === "profiled" && item.customer) ||
        (profileFilter === "missing" && !item.customer);
      const languageMatch = languageFilter === "all" || item.language === languageFilter;
      const queryMatch =
        normalizedQuery.length === 0 ||
        [
          item.session_id,
          item.summary,
          item.customer?.name,
          item.customer?.phone,
          item.customer?.email,
          item.customer?.profession,
          item.customer?.budget_range,
          item.customer?.source,
        ].some((value) => searchableText(value).includes(normalizedQuery));

      return profileMatch && languageMatch && queryMatch;
    });
  }, [languageFilter, profileFilter, query, summaries]);

  const selectedConversation =
    filteredSummaries.find((item) => item.session_id === selectedSessionId) ??
    filteredSummaries[0] ??
    null;
  const visibleSummaries = filteredSummaries.slice(0, visibleCount);

  useEffect(() => {
    if (!filteredSummaries.length) {
      if (selectedSessionId) setSelectedSessionId("");
      return;
    }

    const stillVisible = filteredSummaries.some((item) => item.session_id === selectedSessionId);
    if (!stillVisible) {
      setSelectedSessionId(filteredSummaries[0].session_id);
    }
  }, [filteredSummaries, selectedSessionId]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [languageFilter, profileFilter, query]);

  useEffect(() => {
    if (!selectedConversation) setIsDetailsOpen(false);
  }, [selectedConversation]);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", isDetailsOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [isDetailsOpen]);

  const selectConversation = (sessionId) => {
    if (!sessionId) return;
    setSelectedSessionId(sessionId);
    setIsDetailsOpen(true);
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
      <section className="mb-6 flex flex-col gap-5 border-b border-slate-200 pb-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
            <Sparkles size={14} />
            Conversation intelligence
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Customer conversations
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Triage recent sessions, spot high-intent leads, and review customer context without
            opening every transcript.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[560px]">
          {[
            { label: "Sessions", value: summaryStats.totalSessions, icon: MessageSquareText },
            { label: "Profiles", value: summaryStats.withCustomer, icon: UsersRound },
            { label: "Turns", value: summaryStats.totalTurns, icon: Clock3 },
            { label: "Hot leads", value: summaryStats.hotLeads, icon: CheckCircle2 },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                  <Icon size={16} className="text-slate-400" />
                </div>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-950">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {loading ? (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-12 text-sm text-slate-500 shadow-sm">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
          Loading summaries…
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-sm shadow-sm">
          <p className="font-semibold text-rose-700">Could not load conversation summaries</p>
          <p className="mt-2 text-rose-600">{error}</p>
        </div>
      ) : summaries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-600">
            No summaries were found for this project.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            New conversations will appear here as they come in.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
            <aside className="hidden min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:order-2 xl:block xl:sticky xl:top-6 xl:self-start">
              <CustomerProfilePanel conversation={selectedConversation} />
            </aside>

            <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:order-1">
              <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center">
                <label className="relative min-w-0 flex-1">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search by customer, phone, source, budget or session"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </label>

                <div className="grid grid-cols-2 gap-2 sm:flex">
                  <label className="relative">
                    <SlidersHorizontal
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <select
                      value={languageFilter}
                      onChange={(event) => setLanguageFilter(event.target.value)}
                      className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 sm:w-36"
                    >
                      <option value="all">All languages</option>
                      <option value="gu">Gujarati</option>
                      <option value="hi">Hindi</option>
                      <option value="en">English</option>
                    </select>
                  </label>

                  <select
                    value={profileFilter}
                    onChange={(event) => setProfileFilter(event.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 sm:w-36"
                  >
                    <option value="all">All profiles</option>
                    <option value="profiled">Profiled</option>
                    <option value="missing">Missing</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-500">
                <span>
                  Showing {visibleSummaries.length} of {filteredSummaries.length}
                </span>
                <span>{summaryStats.totalSessions} total sessions</span>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredSummaries.length === 0 ? (
                  <div className="p-10 text-center">
                    <p className="text-sm font-semibold text-slate-700">
                      No matching conversations
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Try another search term or clear the active filters.
                    </p>
                  </div>
                ) : (
                  visibleSummaries.map((item, index) => {
                    const isSelected = item.session_id === selectedConversation?.session_id;
                    const score = getLeadScore(item);
                    const detailPath = conversationDetailPath(item.session_id);

                    return (
                      <div
                        key={`${item.session_id || "session"}-${index}`}
                        className={`grid w-full gap-4 border-l-4 px-4 py-4 text-left transition hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_180px] ${
                          isSelected
                            ? "border-l-blue-600 bg-blue-50/60"
                            : LANGUAGE_ACCENT[item.language] ?? "border-l-slate-300"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => selectConversation(item.session_id)}
                          className="flex min-w-0 gap-3 text-left"
                        >
                          <div
                            className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                              item.customer
                                ? avatarColorFor(item.customer.name)
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {item.customer ? (
                              initialsFor(item.customer.name)
                            ) : (
                              <UserRound size={19} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-semibold text-slate-950">
                                {getCustomerName(item)}
                              </p>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${getLeadScoreClass(score)}`}
                              >
                                {score}
                              </span>
                            </div>
                            <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
                              {item.summary || "No summary available."}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                              <span className="inline-flex items-center gap-1.5">
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${LANGUAGE_DOT[item.language] ?? "bg-slate-400"}`}
                                />
                                {languageLabel(item.language)}
                              </span>
                              <span>{item.turn_count ?? 0} turns</span>
                              <span className="font-mono">{item.session_id}</span>
                            </div>
                          </div>
                        </button>

                        <div className="flex items-center justify-between gap-3 sm:justify-end">
                          <div className="text-left sm:text-right">
                            <p className="text-xs font-medium text-slate-500">
                              {formatDate(item.started_at)}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {item.customer?.source || "Unattributed source"}
                            </p>
                          </div>
                          <Link
                            to={detailPath}
                            state={{ summary: item }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                          >
                            Details
                            <ChevronRight
                              size={16}
                              className={isSelected ? "text-blue-600" : "text-slate-300"}
                            />
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {visibleCount < filteredSummaries.length && (
                <div className="border-t border-slate-100 p-4">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                    className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Show next {Math.min(PAGE_SIZE, filteredSummaries.length - visibleCount)}
                  </button>
                </div>
              )}
            </section>
          </div>

          {isDetailsOpen && selectedConversation && (
            <div className="fixed inset-0 z-40 xl:hidden">
              <button
                type="button"
                aria-label="Close conversation details"
                onClick={() => setIsDetailsOpen(false)}
                className="absolute inset-0 bg-slate-950/50"
              />
              <div className="absolute inset-x-0 bottom-0 max-h-[92vh] overflow-hidden rounded-t-3xl bg-white shadow-2xl">
                <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950">
                      {getCustomerName(selectedConversation)}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {selectedConversation.customer?.profession || "Profile not yet captured"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDetailsOpen(false)}
                    aria-label="Close details"
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="max-h-[calc(92vh-58px)] overflow-y-auto">
                  <CustomerProfilePanel conversation={selectedConversation} />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Conversations;
