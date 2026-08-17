import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { formatDate, avatarColorFor, initialsFor, conversationDetailPath } from "../lib/conversation";

const CustomerDetails = () => {
    const { project_id, customer_id } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!project_id || !customer_id) return;
        const ctrl = new AbortController();
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(
                    `https://192.168.40.20:8000/customers/${project_id}/profiles/${customer_id}`,
                    { signal: ctrl.signal }
                );
                if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
                const json = await res.json();
                setProfile(json.profile || null);
            } catch (err) {
                if (err.name !== "AbortError") setError(err.message || "Failed to load profile");
            } finally {
                setLoading(false);
            }
        };
        load();
        return () => ctrl.abort();
    }, [project_id, customer_id]);

    if (loading && !profile) return <div className="p-6">Loading…</div>;
    if (error && !profile) return <div className="p-6 text-red-600">{error}</div>;
    if (!profile) return <div className="p-6">No profile found.</div>;

    const customer = profile.customer || {};

    return (
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-full text-xl font-semibold shadow-sm ${avatarColorFor(customer.customer_first_name || customer.name)}`}>
                        {initialsFor((customer.customer_first_name || customer.name) + " " + (customer.customer_last_name || ""))}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            {(customer.customer_first_name || customer.name) ? `${customer.customer_first_name || customer.name} ${customer.customer_last_name || ''}` : 'Unknown'}
                        </h1>
                        <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                            Status: {customer.status || '—'}
                        </div>
                    </div>
                </div>

                <Link
                    to="/customers"
                    className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                    Back
                </Link>
            </div>

            {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

            <div className="">
                <div className="grid gap-6 xl:grid-cols-[1fr_1fr_1fr]">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-1 max-h-125 overflow-y-auto">
                        <h2 className="text-xl font-semibold text-slate-900">Contact</h2>
                        <div className="mt-5 space-y-4">
                            {[
                                ['Phone', customer.customer_phone],
                                ['Email', customer.customer_email],
                                ['Address', customer.customer_address],
                                ['Budget Range', customer.budget_range],
                                ['Notes', customer.notes],
                            ].map(([label, value]) => (
                                <div key={label} className="border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                                    <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">{label}</div>
                                    <div className="mt-1 text-sm text-slate-700">{value || '—'}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm max-h-125 overflow-y-auto">
                        <h2 className="text-xl font-semibold text-slate-900">Sessions</h2>
                        <div className="mt-4 space-y-3">
                            {Array.isArray(profile.sessions) && profile.sessions.length > 0 ? (
                                profile.sessions.map((s) => (
                                    <div key={s.session_id || `session-${Math.random()}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="text-sm text-slate-700">
                                                {s.started_at ? formatDate(s.started_at) : 'No start date'}
                                            </div>
                                            {s.session_id ? (
                                                <Link to={conversationDetailPath(s.session_id, project_id)} className="text-sm font-medium text-sky-700 hover:text-sky-900">Open</Link>
                                            ) : null}
                                        </div>
                                        <div className="mt-1 text-xs text-slate-500">Turn count: {s.turn_count ?? '—'}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-slate-500">No sessions</div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm max-h-125 overflow-y-auto">
                        <h3 className="text-lg font-semibold text-slate-900">Interests</h3>
                        <div className="mt-4 space-y-2">
                            {profile.interests && profile.interests.length > 0 ? (
                                profile.interests.map((item, i) => (
                                    <div key={`${item.interest_type || 'interest'}-${i}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                                        <div><span className="font-medium text-slate-600">Type:</span> {item.interest_type || '—'}</div>
                                        <div><span className="font-medium text-slate-600">Value:</span> {item.interest_value || '—'}</div>
                                        <div><span className="font-medium text-slate-600">Mention count:</span> {item.mention_count ?? '—'}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-slate-500">No interests</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr_1fr_1fr] mt-6">

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm max-h-125 overflow-y-auto">
                        <h3 className="text-lg font-semibold text-slate-900">Signals</h3>
                        <div className="mt-4 space-y-2">
                            {profile.signals && profile.signals.length > 0 ? (
                                profile.signals.map((item, i) => (
                                    <div key={`${item.signal_type || 'signal'}-${i}`} className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-slate-700">
                                        <div><span className="font-medium text-slate-600">Type:</span> {item.signal_type || '—'}</div>
                                        <div><span className="font-medium text-slate-600">Value:</span> {item.signal_value || '—'}</div>
                                        <div><span className="font-medium text-slate-600">Confidence:</span> {item.confidence ?? '—'}</div>
                                        <div><span className="font-medium text-slate-600">Detected at:</span> {item.detected_at ? formatDate(item.detected_at) : '—'}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-slate-500">No signals</div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm max-h-125 overflow-y-auto">
                        <h3 className="text-lg font-semibold text-slate-900">Human handoff requests</h3>
                        <div className="mt-4 space-y-2">
                            {profile.human_handoff_requests && profile.human_handoff_requests.length > 0 ? (
                                profile.human_handoff_requests.map((item, i) => (
                                    <div key={`${item.session_id || 'handoff'}-${i}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                                        <div><span className="font-medium text-slate-600">Session:</span> {item.session_id || '—'}</div>
                                        <div><span className="font-medium text-slate-600">Reason:</span> {item.reason || '—'}</div>
                                        <div><span className="font-medium text-slate-600">Urgency:</span> {item.urgency || '—'}</div>
                                        <div><span className="font-medium text-slate-600">Preferred time:</span> {item.preferred_time || '—'}</div>
                                        <div><span className="font-medium text-slate-600">Status:</span> {item.status || '—'}</div>
                                        <div><span className="font-medium text-slate-600">Requested at:</span> {item.requested_at ? formatDate(item.requested_at) : '—'}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-slate-500">No handoff requests</div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm max-h-125 overflow-y-auto">
                        <h3 className="text-lg font-semibold text-slate-900">Site visit requests</h3>
                        <div className="mt-4 space-y-2">
                            {profile.site_visit_requests && profile.site_visit_requests.length > 0 ? (
                                profile.site_visit_requests.map((item, i) => (
                                    <div key={`${item.id || 'sitevisit'}-${i}`} className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-slate-700">
                                        <div><span className="font-medium text-slate-600">Customer:</span> {item.customer_name || '—'}</div>
                                        <div><span className="font-medium text-slate-600">Phone:</span> {item.customer_phone || '—'}</div>
                                        <div><span className="font-medium text-slate-600">Preferred date:</span> {item.preferred_date || '—'}</div>
                                        <div><span className="font-medium text-slate-600">Preferred time:</span> {item.preferred_time || '—'}</div>
                                        <div><span className="font-medium text-slate-600">Party size:</span> {item.party_size ?? '—'}</div>
                                        <div><span className="font-medium text-slate-600">Status:</span> {item.status || '—'}</div>
                                        <div><span className="font-medium text-slate-600">Requested at:</span> {item.requested_at ? formatDate(item.requested_at) : '—'}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-slate-500">No site visit requests</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetails;