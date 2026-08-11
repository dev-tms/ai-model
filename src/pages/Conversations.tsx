import { useEffect, useMemo, useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Mail,
  MessageSquareText,
  Phone,
  Search,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';

type Customer = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  profession: string;
  family_size: string;
  budget_range: string;
  source: string;
};

type ConversationSummary = {
  session_id: string;
  language: string;
  turn_count: number;
  started_at: string;
  summary: string;
  customer: Customer | null;
};

type SummariesResponse = {
  summaries: ConversationSummary[];
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

const LANGUAGE_LABELS: Record<string, string> = {
  gu: 'Gujarati',
  hi: 'Hindi',
  en: 'English',
};

const LANGUAGE_DOT: Record<string, string> = {
  gu: 'bg-amber-500',
  hi: 'bg-rose-500',
  en: 'bg-sky-500',
};

const LANGUAGE_ACCENT: Record<string, string> = {
  gu: 'border-l-amber-400',
  hi: 'border-l-rose-400',
  en: 'border-l-sky-400',
};

const AVATAR_PALETTE = [
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
];

const PAGE_SIZE = 50;

const avatarColorFor = (name: string) => {
  const code = name.charCodeAt(0) || 0;
  return AVATAR_PALETTE[code % AVATAR_PALETTE.length];
};

const initialsFor = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('');

const getCustomerName = (item: ConversationSummary) => item.customer?.name ?? 'Unknown visitor';

const getLeadScore = (item: ConversationSummary) => {
  if (!item.customer) return 'New';
  if (item.turn_count >= 10) return 'Hot';
  if (item.turn_count >= 5) return 'Warm';
  return 'Light';
};

const getLeadScoreClass = (score: string) => {
  if (score === 'Hot') return 'bg-rose-50 text-rose-700 ring-rose-200';
  if (score === 'Warm') return 'bg-amber-50 text-amber-700 ring-amber-200';
  if (score === 'Light') return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  return 'bg-slate-100 text-slate-600 ring-slate-200';
};

const Conversations = () => {
  const dummy_data = [
    {
      session_id: 'abc123',
      language: 'gu',
      turn_count: 8,
      started_at: '2026-08-10T18:22:01',
      summary:
        'Customer asked about 4 BHK layouts and pool access, wanted to know possession date.',
      customer: {
        id: 14,
        name: 'Rakesh Patel',
        phone: '9876543210',
        email: null,
        profession: 'Businessman',
        family_size: '4',
        budget_range: '1.5-2 crore',
        source: 'Facebook ad',
      },
    },
    {
      session_id: 'def456',
      language: 'hi',
      turn_count: 3,
      started_at: '2026-08-10T17:05:44',
      summary: 'Customer asked general project location questions.',
      customer: null,
    },
    {
      session_id: 'ghi789',
      language: 'en',
      turn_count: 12,
      started_at: '2026-08-10T15:40:12',
      summary:
        'Customer compared 3 BHK vs 4 BHK pricing, asked about EMI options and requested a site visit for next weekend.',
      customer: {
        id: 27,
        name: 'Priya Shah',
        phone: '9823456712',
        email: 'priya.shah@example.com',
        profession: 'Doctor',
        family_size: '3',
        budget_range: '2-2.5 crore',
        source: 'Instagram ad',
      },
    },
    {
      session_id: 'jkl012',
      language: 'gu',
      turn_count: 5,
      started_at: '2026-08-10T14:12:37',
      summary: 'Customer inquired about clubhouse amenities and maintenance charges.',
      customer: {
        id: 31,
        name: 'Nikunj Mehta',
        phone: '9998877665',
        email: null,
        profession: 'Chartered Accountant',
        family_size: '5',
        budget_range: '1-1.5 crore',
        source: 'Website form',
      },
    },
    {
      session_id: 'mno345',
      language: 'hi',
      turn_count: 2,
      started_at: '2026-08-10T12:05:09',
      summary: 'Customer asked only about the sales office address and timings.',
      customer: null,
    },
    {
      session_id: 'pqr678',
      language: 'en',
      turn_count: 15,
      started_at: '2026-08-09T19:48:23',
      summary:
        'Extended conversation about floor plans, vastu compliance, parking allocation, and payment plan options. Customer requested a callback from sales team.',
      customer: {
        id: 42,
        name: 'Sanjay Iyer',
        phone: '9765432109',
        email: 'sanjay.iyer@example.com',
        profession: 'IT Consultant',
        family_size: '4',
        budget_range: '1.8-2.2 crore',
        source: 'Google search',
      },
    },
    {
      session_id: 'stu901',
      language: 'gu',
      turn_count: 6,
      started_at: '2026-08-09T16:30:55',
      summary: 'Customer asked about resale value and nearby schools for children.',
      customer: {
        id: 55,
        name: 'Foram Desai',
        phone: '9812345678',
        email: null,
        profession: 'Teacher',
        family_size: '4',
        budget_range: '1.2-1.5 crore',
        source: 'Referral',
      },
    },
    {
      session_id: 'vwx234',
      language: 'hi',
      turn_count: 4,
      started_at: '2026-08-09T11:15:00',
      summary: 'Customer asked about loan assistance and bank tie-ups.',
      customer: {
        id: 61,
        name: 'Manish Verma',
        phone: '9871122334',
        email: 'manish.verma@example.com',
        profession: 'Bank Manager',
        family_size: '2',
        budget_range: '90 lakh - 1.2 crore',
        source: 'Facebook ad',
      },
    },
    {
      session_id: 'yz1abc',
      language: 'en',
      turn_count: 1,
      started_at: '2026-08-09T09:02:18',
      summary: 'Customer sent a single greeting message and did not continue.',
      customer: null,
    },
  ];
  const [summaries, setSummaries] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState(summaries[0]?.session_id ?? '');
  const [query, setQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [profileFilter, setProfileFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // useEffect(() => {
  //   const controller = new AbortController();

  //   const loadSummaries = async () => {
  //     try {
  //       setLoading(true);
  //       setError(null);

  //       const response = await fetch('https://192.168.40.20:8000/customers/praangan/summaries', {
  //         signal: controller.signal,
  //       });

  //       console.log('Response status:', response);

  //       if (!response.ok) {
  //         throw new Error(`Failed to load summaries: ${response.status}`);
  //       }

  //       const data = (await response.json()) as SummariesResponse;
  //       console.log('data', data);
  //       setSummaries(data.summaries ?? []);
  //     } catch (err) {
  //       if ((err as Error).name !== 'AbortError') {
  //         setError((err as Error).message || 'Unable to load summaries');
  //         setSummaries([]);
  //       }
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   loadSummaries();

  //   return () => controller.abort();
  // }, []);

  const summaryStats = useMemo(
    () => ({
      totalSessions: summaries.length,
      withCustomer: summaries.filter(item => item.customer !== null).length,
      withoutCustomer: summaries.filter(item => item.customer === null).length,
      totalTurns: summaries.reduce((total, item) => total + item.turn_count, 0),
      hotLeads: summaries.filter(item => getLeadScore(item) === 'Hot').length,
    }),
    [summaries]
  );

  const filteredSummaries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return summaries.filter(item => {
      const profileMatch =
        profileFilter === 'all' ||
        (profileFilter === 'profiled' && item.customer) ||
        (profileFilter === 'missing' && !item.customer);

      const languageMatch = languageFilter === 'all' || item.language === languageFilter;

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
        ]
          .filter(Boolean)
          .some(value => value?.toLowerCase().includes(normalizedQuery));

      return profileMatch && languageMatch && queryMatch;
    });
  }, [languageFilter, profileFilter, query, summaries]);

  const selectedConversation =
    filteredSummaries.find(item => item.session_id === selectedSessionId) ?? filteredSummaries[0];

  const visibleSummaries = filteredSummaries.slice(0, visibleCount);

  useEffect(() => {
    if (
      filteredSummaries.length > 0 &&
      !filteredSummaries.some(item => item.session_id === selectedSessionId)
    ) {
      setSelectedSessionId(filteredSummaries[0].session_id);
    }
  }, [filteredSummaries, selectedSessionId]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [languageFilter, profileFilter, query]);

  useEffect(() => {
    if (!selectedConversation) {
      setIsDetailsOpen(false);
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    document.body.classList.toggle('overflow-hidden', isDetailsOpen);

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isDetailsOpen]);

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
      <section className="mb-5 flex flex-col gap-5 border-b border-slate-200 pb-5 xl:flex-row xl:items-end xl:justify-between">
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
            { label: 'Sessions', value: summaryStats.totalSessions, icon: MessageSquareText },
            { label: 'Profiles', value: summaryStats.withCustomer, icon: UsersRound },
            { label: 'Turns', value: summaryStats.totalTurns, icon: Clock3 },
            { label: 'Hot leads', value: summaryStats.hotLeads, icon: CheckCircle2 },
          ].map(stat => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
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
        <div className="flex items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white p-12 text-sm text-slate-500 shadow-sm">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
          Loading summaries…
        </div>
      ) : error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-8 text-sm shadow-sm">
          <p className="font-semibold text-rose-700">Could not load conversation summaries</p>
          <p className="mt-2 text-rose-600">{error}</p>
        </div>
      ) : summaries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-14 text-center shadow-sm">
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
            <aside className="hidden min-w-0 rounded-lg border border-slate-200 bg-white shadow-sm xl:order-2 xl:block xl:sticky xl:top-6 xl:self-start">
              {selectedConversation ? (
                <div>
                  <div className="border-b border-slate-200 p-4 xl:p-5">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold xl:h-12 xl:w-12 xl:text-base ${
                          selectedConversation.customer
                            ? avatarColorFor(selectedConversation.customer.name)
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {selectedConversation.customer ? (
                          initialsFor(selectedConversation.customer.name)
                        ) : (
                          <UserRound size={21} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-semibold text-slate-950 xl:text-lg">
                          {getCustomerName(selectedConversation)}
                        </p>
                        <p className="mt-1 truncate text-sm text-slate-500">
                          {selectedConversation.customer?.profession ?? 'Profile not yet captured'}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getLeadScoreClass(
                          getLeadScore(selectedConversation)
                        )}`}
                      >
                        {getLeadScore(selectedConversation)}
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-2 rounded-lg bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600 xl:hidden">
                      {selectedConversation.summary}
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-2 xl:mt-5">
                      <a
                        href={
                          selectedConversation.customer
                            ? `tel:${selectedConversation.customer.phone}`
                            : undefined
                        }
                        className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition ${
                          selectedConversation.customer
                            ? 'bg-slate-950 text-white hover:bg-slate-800'
                            : 'pointer-events-none bg-slate-100 text-slate-400'
                        }`}
                      >
                        <Phone size={16} />
                        Call
                      </a>
                      <a
                        href={
                          selectedConversation.customer?.email
                            ? `mailto:${selectedConversation.customer.email}`
                            : undefined
                        }
                        className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition ${
                          selectedConversation.customer?.email
                            ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            : 'pointer-events-none border-slate-200 bg-slate-50 text-slate-400'
                        }`}
                      >
                        <Mail size={16} />
                        Email
                      </a>
                    </div>
                  </div>

                  <div className="hidden space-y-5 p-5 xl:block">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Session summary
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {selectedConversation.summary}
                      </p>
                    </div>

                    <dl className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg bg-slate-50 p-3">
                        <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                          <CalendarClock size={14} />
                          Started
                        </dt>
                        <dd className="mt-1 font-semibold text-slate-950">
                          {formatDate(selectedConversation.started_at)}
                        </dd>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3">
                        <dt className="text-xs font-medium text-slate-500">Language</dt>
                        <dd className="mt-1 font-semibold text-slate-950">
                          {LANGUAGE_LABELS[selectedConversation.language] ??
                            selectedConversation.language.toUpperCase()}
                        </dd>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3">
                        <dt className="text-xs font-medium text-slate-500">Turns</dt>
                        <dd className="mt-1 font-semibold tabular-nums text-slate-950">
                          {selectedConversation.turn_count}
                        </dd>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3">
                        <dt className="text-xs font-medium text-slate-500">Session ID</dt>
                        <dd className="mt-1 truncate font-mono text-xs font-semibold text-slate-950">
                          {selectedConversation.session_id}
                        </dd>
                      </div>
                    </dl>

                    {selectedConversation.customer ? (
                      <dl className="space-y-3 border-t border-slate-100 pt-5 text-sm">
                        {[
                          ['Phone', selectedConversation.customer.phone],
                          ['Email', selectedConversation.customer.email ?? 'Not shared'],
                          ['Budget', selectedConversation.customer.budget_range],
                          ['Family size', selectedConversation.customer.family_size],
                          ['Source', selectedConversation.customer.source],
                        ].map(([label, value]) => (
                          <div key={label} className="flex items-start justify-between gap-4">
                            <dt className="text-slate-500">{label}</dt>
                            <dd className="min-w-0 text-right font-semibold text-slate-900">
                              {value}
                            </dd>
                          </div>
                        ))}
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
              ) : (
                <div className="p-10 text-center">
                  <p className="text-sm font-semibold text-slate-700">Select a conversation</p>
                  <p className="mt-1 text-xs text-slate-500">Details will appear here.</p>
                </div>
              )}
            </aside>

            <section className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm xl:order-1">
              <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center">
                <label className="relative min-w-0 flex-1">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="search"
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    placeholder="Search by customer, phone, source, budget or session"
                    className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
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
                      onChange={event => setLanguageFilter(event.target.value)}
                      className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 sm:w-36"
                    >
                      <option value="all">All languages</option>
                      <option value="gu">Gujarati</option>
                      <option value="hi">Hindi</option>
                      <option value="en">English</option>
                    </select>
                  </label>

                  <select
                    value={profileFilter}
                    onChange={event => setProfileFilter(event.target.value)}
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 sm:w-36"
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
                  visibleSummaries.map(item => {
                    const isSelected = item.session_id === selectedConversation?.session_id;
                    const score = getLeadScore(item);

                    return (
                      <button
                        key={item.session_id}
                        type="button"
                        onClick={() => {
                          setSelectedSessionId(item.session_id);
                          setIsDetailsOpen(true);
                        }}
                        className={`grid w-full gap-4 border-l-4 px-4 py-4 text-left transition hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_180px] ${
                          isSelected
                            ? 'border-l-blue-600 bg-blue-50/60'
                            : (LANGUAGE_ACCENT[item.language] ?? 'border-l-slate-300')
                        }`}
                      >
                        <div className="flex min-w-0 gap-3">
                          <div
                            className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                              item.customer
                                ? avatarColorFor(item.customer.name)
                                : 'bg-slate-100 text-slate-500'
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
                                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${getLeadScoreClass(
                                  score
                                )}`}
                              >
                                {score}
                              </span>
                            </div>
                            <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
                              {item.summary}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                              <span className="inline-flex items-center gap-1.5">
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${LANGUAGE_DOT[item.language] ?? 'bg-slate-400'}`}
                                />
                                {LANGUAGE_LABELS[item.language] ?? item.language.toUpperCase()}
                              </span>
                              <span>{item.turn_count} turns</span>
                              <span className="font-mono">{item.session_id}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 sm:justify-end">
                          <div className="text-left sm:text-right">
                            <p className="text-xs font-medium text-slate-500">
                              {formatDate(item.started_at)}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {item.customer?.source ?? 'Unattributed source'}
                            </p>
                          </div>
                          <ChevronRight
                            size={18}
                            className={`shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-300'}`}
                          />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {visibleCount < filteredSummaries.length && (
                <div className="border-t border-slate-100 p-4">
                  <button
                    type="button"
                    onClick={() => setVisibleCount(count => count + PAGE_SIZE)}
                    className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Show next {Math.min(PAGE_SIZE, filteredSummaries.length - visibleCount)}
                  </button>
                </div>
              )}
            </section>
          </div>
          {isDetailsOpen && selectedConversation && (
            <div className="fixed inset-0 z-50 xl:hidden">
              <button
                type="button"
                aria-label="Close conversation details"
                onClick={() => setIsDetailsOpen(false)}
                className="absolute inset-0 bg-slate-950/50"
              />

              <div className="absolute inset-x-0 bottom-0 max-h-[92vh] overflow-hidden rounded-t-2xl bg-white shadow-2xl">
                <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950">
                      {getCustomerName(selectedConversation)}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {selectedConversation.customer?.profession ?? 'Profile not yet captured'}
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
                  <div className="border-b border-slate-200 p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-semibold ${
                          selectedConversation.customer
                            ? avatarColorFor(selectedConversation.customer.name)
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {selectedConversation.customer ? (
                          initialsFor(selectedConversation.customer.name)
                        ) : (
                          <UserRound size={21} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-lg font-semibold text-slate-950">
                          {getCustomerName(selectedConversation)}
                        </p>
                        <p className="mt-1 truncate text-sm text-slate-500">
                          {selectedConversation.customer?.profession ?? 'Profile not yet captured'}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getLeadScoreClass(
                          getLeadScore(selectedConversation)
                        )}`}
                      >
                        {getLeadScore(selectedConversation)}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <a
                        href={
                          selectedConversation.customer
                            ? `tel:${selectedConversation.customer.phone}`
                            : undefined
                        }
                        className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition ${
                          selectedConversation.customer
                            ? 'bg-slate-950 text-white hover:bg-slate-800'
                            : 'pointer-events-none bg-slate-100 text-slate-400'
                        }`}
                      >
                        <Phone size={16} />
                        Call
                      </a>
                      <a
                        href={
                          selectedConversation.customer?.email
                            ? `mailto:${selectedConversation.customer.email}`
                            : undefined
                        }
                        className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition ${
                          selectedConversation.customer?.email
                            ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            : 'pointer-events-none border-slate-200 bg-slate-50 text-slate-400'
                        }`}
                      >
                        <Mail size={16} />
                        Email
                      </a>
                    </div>
                  </div>

                  <div className="space-y-5 p-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Session summary
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {selectedConversation.summary}
                      </p>
                    </div>

                    <dl className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg bg-slate-50 p-3">
                        <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                          <CalendarClock size={14} />
                          Started
                        </dt>
                        <dd className="mt-1 font-semibold text-slate-950">
                          {formatDate(selectedConversation.started_at)}
                        </dd>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3">
                        <dt className="text-xs font-medium text-slate-500">Language</dt>
                        <dd className="mt-1 font-semibold text-slate-950">
                          {LANGUAGE_LABELS[selectedConversation.language] ??
                            selectedConversation.language.toUpperCase()}
                        </dd>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3">
                        <dt className="text-xs font-medium text-slate-500">Turns</dt>
                        <dd className="mt-1 font-semibold tabular-nums text-slate-950">
                          {selectedConversation.turn_count}
                        </dd>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3">
                        <dt className="text-xs font-medium text-slate-500">Session ID</dt>
                        <dd className="mt-1 truncate font-mono text-xs font-semibold text-slate-950">
                          {selectedConversation.session_id}
                        </dd>
                      </div>
                    </dl>

                    {selectedConversation.customer ? (
                      <dl className="space-y-3 border-t border-slate-100 pt-5 text-sm">
                        {[
                          ['Phone', selectedConversation.customer.phone],
                          ['Email', selectedConversation.customer.email ?? 'Not shared'],
                          ['Budget', selectedConversation.customer.budget_range],
                          ['Family size', selectedConversation.customer.family_size],
                          ['Source', selectedConversation.customer.source],
                        ].map(([label, value]) => (
                          <div key={label} className="flex items-start justify-between gap-4">
                            <dt className="text-slate-500">{label}</dt>
                            <dd className="min-w-0 text-right font-semibold text-slate-900">
                              {value}
                            </dd>
                          </div>
                        ))}
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
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Conversations;
