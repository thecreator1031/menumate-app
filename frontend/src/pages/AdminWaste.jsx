import { useEffect, useState } from "react";
import { Plus, Clock, Recycle, Leaf, Wallet } from "lucide-react";
import Navbar from "../components/Navbar";
import CountdownTimer from "../components/CountdownTimer";
import { api, WEEKS } from "../api";

export default function AdminWaste() {
  const [sustainability, setSustainability] = useState(null);
  const [window_, setWindow_] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    Promise.all([
      api.adminGetSustainability(WEEKS.SERVED),
      api.getVotingWindow(WEEKS.VOTING),
    ])
      .then(([s, w]) => {
        setSustainability(s);
        setWindow_(w);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleLog = async (e) => {
    e.preventDefault();
    if (!amount) return;
    setSubmitting(true);
    setError("");
    try {
      await api.adminLogWaste({ amount_kg: Number(amount), notes, week: WEEKS.SERVED });
      setAmount("");
      setNotes("");
      const s = await api.adminGetSustainability(WEEKS.SERVED);
      setSustainability(s);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const extendWindow = async (hours) => {
    const updated = await api.adminUpdateVotingWindow({ extend_hours: hours });
    setWindow_(updated);
  };

  const closeWindowNow = async () => {
    const updated = await api.adminUpdateVotingWindow({ close_now: true });
    setWindow_(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-surface-border border-t-accent-400" />
        </div>
      </div>
    );
  }

  const votingClosed = window_ && new Date(window_.closes_at).getTime() <= Date.now();

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="font-display text-3xl font-semibold text-ash-100">
          Waste & voting control
        </h1>
        <p className="mt-1 text-sm text-ash-400">
          Log daily food waste and manage the voting window for week {WEEKS.VOTING}.
        </p>

        {error && (
          <p className="mt-4 rounded-lg border border-coral-400/30 bg-coral-400/10 px-3 py-2 text-sm text-coral-400">
            {error}
          </p>
        )}

        {/* Voting window control */}
        <div className="mt-8 rounded-2xl border border-surface-border bg-surface p-5">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ash-500">
            Voting window
          </h2>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-ash-400">
              <Clock size={16} className="text-accent-400" />
              {votingClosed ? (
                <span className="text-coral-400">Voting is closed</span>
              ) : (
                <>
                  <span>Closes in</span>
                  <CountdownTimer target={window_.closes_at} />
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => extendWindow(1)}
                className="rounded-lg border border-surface-border px-3 py-1.5 text-xs font-medium text-ash-300 transition-colors hover:border-accent-400/40 hover:text-accent-400"
              >
                +1 hour
              </button>
              <button
                onClick={() => extendWindow(24)}
                className="rounded-lg border border-surface-border px-3 py-1.5 text-xs font-medium text-ash-300 transition-colors hover:border-accent-400/40 hover:text-accent-400"
              >
                +24 hours
              </button>
              <button
                onClick={closeWindowNow}
                className="rounded-lg border border-coral-400/30 px-3 py-1.5 text-xs font-medium text-coral-400 transition-colors hover:bg-coral-400/10"
              >
                Close now
              </button>
            </div>
          </div>
        </div>

        {/* Sustainability summary */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={Recycle}
            label="Waste this week"
            value={`${sustainability.total_waste_kg} kg`}
            sub={`Baseline: ${sustainability.baseline_waste_kg} kg`}
          />
          <SummaryCard
            icon={Leaf}
            label="Waste reduction"
            value={`${sustainability.reduction_pct}%`}
            sub="Vs. pre-MenuMate baseline"
            accent="accent"
          />
          <SummaryCard
            icon={Wallet}
            label="Estimated savings"
            value={`₹${sustainability.estimated_savings}`}
            sub="From reduced food waste"
            accent="saffron"
          />
        </div>

        {/* Log waste form */}
        <div className="mt-8 rounded-2xl border border-surface-border bg-surface p-5">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ash-500">
            Log today's waste
          </h2>
          <form onSubmit={handleLog} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[140px_1fr_auto]">
            <input
              type="number"
              step="0.1"
              min="0"
              required
              placeholder="kg"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-xl border border-surface-border bg-surface-raised px-4 py-2.5 text-sm text-ash-100 placeholder:text-ash-500 focus:border-accent-400"
            />
            <input
              placeholder="Notes (e.g. Lunch leftovers — Rajma Chawal)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-xl border border-surface-border bg-surface-raised px-4 py-2.5 text-sm text-ash-100 placeholder:text-ash-500 focus:border-accent-400"
            />
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-400 px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-accent-200 disabled:opacity-50"
            >
              <Plus size={16} />
              Log
            </button>
          </form>
        </div>

        {/* Waste log list */}
        <div className="mt-8">
          <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-ash-500">
            Recent entries
          </h2>
          <div className="space-y-2">
            {sustainability.daily.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface p-3 text-sm"
              >
                <span className="text-ash-400">{entry.date}</span>
                <span className="flex-1 px-3 text-ash-300">{entry.notes || "—"}</span>
                <span className="font-mono font-semibold text-ash-100">{entry.amount_kg} kg</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, sub, accent = "accent" }) {
  const accentClasses = {
    accent: "bg-accent-400/10 text-accent-400",
    saffron: "bg-saffron-400/10 text-saffron-400",
  };
  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-5">
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${accentClasses[accent]}`}>
        <Icon size={18} />
      </span>
      <p className="mt-3 font-display text-2xl font-semibold text-ash-100">{value}</p>
      <p className="text-sm font-medium text-ash-300">{label}</p>
      <p className="mt-1 text-xs text-ash-500">{sub}</p>
    </div>
  );
}
