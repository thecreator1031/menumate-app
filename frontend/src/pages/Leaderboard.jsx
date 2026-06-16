import { useEffect, useState } from "react";
import { Trophy, Lock } from "lucide-react";
import Navbar from "../components/Navbar";
import DietBadge from "../components/DietBadge";
import CountdownTimer from "../components/CountdownTimer";
import { getFoodIcon } from "../foodIcons";
import { api, WEEKS } from "../api";

const MEDAL = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
  const [data, setData] = useState(null);
  const [window_, setWindow_] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getVotingWindow(WEEKS.VOTING),
      api.getLeaderboard(WEEKS.VOTING),
    ])
      .then(([w, lb]) => {
        setWindow_(w);
        setData(lb);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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

  if (error || !data || !window_) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto max-w-3xl px-6 py-10">
          <p className="rounded-lg border border-coral-400/30 bg-coral-400/10 px-3 py-2 text-sm text-coral-400">
            {error || "Could not load leaderboard"}
          </p>
        </div>
      </div>
    );
  }

  const votingClosed = new Date(window_.closes_at).getTime() <= Date.now();

  if (!votingClosed) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto max-w-md px-6 py-20 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-raised text-accent-400">
            <Lock size={24} />
          </span>
          <h1 className="mt-6 font-display text-2xl font-semibold text-ash-100">
            Leaderboard is hidden until voting closes
          </h1>
          <p className="mt-2 text-sm text-ash-400">
            This keeps the vote fair — results show once the window ends.
          </p>
          <p className="mt-6 font-mono text-sm text-ash-300">
            Reveals in <CountdownTimer target={window_.closes_at} />
          </p>
        </div>
      </div>
    );
  }

  const entries = data.entries;
  const maxVotes = Math.max(1, ...entries.map((e) => e.total_votes));

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display text-3xl font-semibold text-ash-100">
          Leaderboard
        </h1>
        <p className="mt-1 text-sm text-ash-400">
          The most (and least) loved dishes for week {data.week}, based on
          everyone's votes.
        </p>

        <div className="mt-8 space-y-2">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className="flex items-center gap-4 rounded-2xl border border-surface-border bg-surface p-4"
            >
              <span className="w-8 text-center text-lg">
                {MEDAL[index] || (
                  <span className="font-mono text-sm text-ash-500">#{index + 1}</span>
                )}
              </span>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-raised text-xl">
                {getFoodIcon(entry)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-sm font-semibold text-ash-100">
                    {entry.name}
                  </h3>
                  <DietBadge tag={entry.dietary_tag} />
                  <span className="rounded-full bg-surface-raised px-2.5 py-1 text-xs font-medium text-ash-500">
                    {entry.category}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
                  <div
                    className="h-full rounded-full bg-accent-400"
                    style={{ width: `${(entry.total_votes / maxVotes) * 100}%` }}
                  />
                </div>
              </div>
              <span className="flex items-center gap-1.5 font-mono text-sm font-semibold text-ash-100">
                <Trophy size={14} className="text-saffron-400" />
                {entry.total_votes}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
