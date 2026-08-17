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
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-start gap-4">
        <div className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl font-semibold ${avatarColorFor(customer.customer_first_name || customer.name)}`}>
          {initialsFor((customer.customer_first_name || customer.name) + " " + (customer.customer_last_name || ""))}
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900">{(customer.customer_first_name || customer.name) ? `${customer.customer_first_name || customer.name} ${customer.customer_last_name || ''}` : 'Unknown'}</h1>
          <p className="mt-1 text-sm text-slate-500">Status: {customer.status || '—'}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Link to="/customers" className="text-sm text-slate-500">Back</Link>
        </div>
      </div>

      {error && <div className="mb-4 text-sm text-rose-700">{error}</div>}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Contact</h2>
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs text-slate-500">Phone</label>
              <div className="mt-1 text-sm text-slate-700">{customer.customer_phone || '—'}</div>
            </div>

            <div>
              <label className="block text-xs text-slate-500">Email</label>
              <div className="mt-1 text-sm text-slate-700">{customer.customer_email || '—'}</div>
            </div>

            <div>
              <label className="block text-xs text-slate-500">Address</label>
              <div className="mt-1 text-sm text-slate-700">{customer.customer_address || '—'}</div>
            </div>

            <div>
              <label className="block text-xs text-slate-500">Budget Range</label>
              <div className="mt-1 text-sm text-slate-700">{customer.budget_range || '—'}</div>
            </div>
            
            <div>
              <label className="block text-xs text-slate-500">Notes</label>
              <div className="mt-1 text-sm text-slate-700">{customer.notes || '—'}</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Sessions</h2>
          <div className="mt-4 space-y-3">
            {Array.isArray(profile.sessions) && profile.sessions.length > 0 ? (
              profile.sessions.map((s) => (
                <div key={s.session_id} className="flex items-center justify-between">
                  <div className="text-sm text-slate-700">{formatDate(s.started_at)} — {s.turn_count} turns</div>
                  <Link to={conversationDetailPath(s.session_id, project_id)} className="text-sm text-slate-600">Open</Link>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-500">No sessions</div>
            )}
          </div>

          <h3 className="mt-6 text-sm font-semibold text-slate-900">Interests</h3>
          <div className="mt-2">
            {profile.interests && profile.interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((it, i) => (
                  <span key={i} className="rounded-full bg-slate-100 px-3 py-1 text-xs">{it}</span>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500">No interests</div>
            )}
          </div>

          <h3 className="mt-4 text-sm font-semibold text-slate-900">Signals</h3>
          <div className="mt-2">
            {profile.signals && profile.signals.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.signals.map((it, i) => (
                  <span key={i} className="rounded-full bg-amber-100 px-3 py-1 text-xs">{it}</span>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500">No signals</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;