import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { formatDate, initialsFor, avatarColorFor, getLeadScoreFromTurns, getLeadScoreClass } from "../lib/conversation";

const PAGE_SIZE = 10;

const CustomersList = () => {
    // const { project_id } = useParams();
    const project_id = "praangan"; // Hardcoded for testing purposes
    const [profiles, setProfiles] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!project_id) return;
        const ctrl = new AbortController();

        const load = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch(
                    `https://192.168.40.20:8000/customers/${project_id}/profiles`,
                    {
                        method: "POST",
                        signal: ctrl.signal,
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ page, limit: PAGE_SIZE }),
                    }
                );
                if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
                const json = await res.json();
                console.log("res",json)
                setProfiles(json.profiles || []);
                setPagination(json.pagination || null);
            } catch (err) {
                if (err.name !== "AbortError") setError(err.message || "Failed to load profiles");
            } finally {
                setLoading(false);
            }
        };

        load();
        return () => ctrl.abort();
    }, [project_id, page]);

    const goToPage = (n) => {
        if (!pagination) return;
        if (n < 1 || n > pagination.total_pages) return;
        setPage(n);
    };

    return (
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-slate-900">Customers</h1>

            {loading ? (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading customers…</div>
            ) : error ? (
                <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>
            ) : (
                <div className="mt-6 space-y-4">
                    {profiles.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">No customers found.</div>
                    ) : (
                        profiles.map((item, idx) => {
                            const customer = item.customer || {};
                            const session = (item.sessions && item.sessions[0]) || null;
                            const turns = session?.turn_count ?? 0;
                            const score = getLeadScoreFromTurns(turns, Boolean(customer && Object.keys(customer).length));

                            return (
                                <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                        <div className={`flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold ${customer ? avatarColorFor(customer.customer_first_name || customer.name) : 'bg-slate-100 text-slate-500'}`}>
                                            {customer ? initialsFor((customer.customer_first_name || customer.name) + " " + (customer.customer_last_name || "")) : "?"}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                                                <div className="min-w-0">
                                                    <p className="truncate text-lg sm:text-xl font-semibold text-slate-900">{(customer.customer_first_name || customer.name) ? `${customer.customer_first_name || customer.name} ${customer.customer_last_name || ''}` : 'Unknown'}</p>
                                                    <p className="mt-1 text-sm text-slate-500">{customer.customer_email || customer.customer_phone || 'No contact'}</p>
                                                </div>

                                                <div className="mt-2 sm:mt-0 text-sm text-slate-500 sm:ml-4">
                                                    {session && <div>Started {formatDate(session.started_at)}</div>}
                                                </div>
                                            </div>

                                            <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                                <div className="text-sm text-slate-500">Status: {customer.status || '—'}</div>
                                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getLeadScoreClass(score)}`}>{score}</span>
                                                    <Link
                                                        to={`/customers/${project_id}/${customer.id}`}
                                                        className="ml-auto sm:ml-0 inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium text-slate-600 hover:text-slate-900 border"
                                                    >
                                                        Details
                                                    </Link>
                                                    {session && (
                                                        <Link
                                                            to={`/customers/${project_id}/conversation/${session?.session_id || ''}`}
                                                            state={{ summary: item }}
                                                            className="inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium text-slate-600 hover:text-slate-900 border"
                                                        >
                                                            View
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {pagination && (
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-slate-500">Page {pagination.page} of {pagination.total_pages}</div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => goToPage(page - 1)} disabled={!pagination.has_previous} className="inline-flex items-center gap-2 rounded-md border px-3 py-1 text-sm disabled:opacity-50">
                                    Prev
                                </button>
                                <button onClick={() => goToPage(page + 1)} disabled={!pagination.has_next} className="inline-flex items-center gap-2 rounded-md border px-3 py-1 text-sm disabled:opacity-50">
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomersList;