import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Users, Star, Vote, Recycle, MessageSquare, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import Navbar from "../components/Navbar";
import DietBadge from "../components/DietBadge";
import { getFoodIcon } from "../foodIcons";
import { api } from "../api";

const TAG_COLORS = {
  veg: "#34D399",
  non_veg: "#FB7185",
  jain: "#FBBF24",
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .adminDashboard()
      .then(setData)
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

  if (error || !data) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto max-w-4xl px-6 py-10">
          <p className="rounded-lg border border-coral-400/30 bg-coral-400/10 px-3 py-2 text-sm text-coral-400">
            {error || "Could not load dashboard"}
          </p>
        </div>
      </div>
    );
  }

  const chartData = data.leaderboard.map((item) => ({
    name: item.name,
    votes: item.total_votes,
    color: TAG_COLORS[item.dietary_tag] || "#34D399",
  }));

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="font-display text-3xl font-semibold text-ash-100">
          Mess dashboard
        </h1>
        <p className="mt-1 text-sm text-ash-400">
          Week {data.current_week} summary and live demand for week {data.voting_week}.
        </p>

        {/* KPI row */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            icon={Users}
            label="Total students"
            value={data.total_students}
            sub="Registered accounts"
          />
          <KpiCard
            icon={Star}
            label="Satisfaction index"
            value={`${data.satisfaction_index} / 5`}
            sub="Average dish rating this week"
          />
          <KpiCard
            icon={Vote}
            label="Votes cast"
            value={data.total_votes_cast}
            sub={`By ${data.total_participants} of ${data.total_students} students`}
          />
          <KpiCard
            icon={Recycle}
            label="Waste reduction"
            value={`${data.sustainability.reduction_pct}%`}
            sub={`${data.sustainability.total_waste_kg} kg vs ${data.sustainability.baseline_waste_kg} kg baseline`}
            accent="saffron"
          />
        </div>

        {/* Most / Least preferred alerts */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {data.most_preferred_item && (
            <div className="flex items-start gap-4 rounded-2xl border border-accent-400/30 bg-accent-400/5 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-400/10 text-accent-400">
                <TrendingUp size={20} />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-accent-400">
                  Most preferred this week
                </p>
                <p className="mt-1 font-display text-lg font-semibold text-ash-100">
                  {data.most_preferred_item.name}
                </p>
                <p className="text-sm text-ash-400">
                  {data.most_preferred_item.total_votes} votes · Will not repeat next-next week
                </p>
                <DietBadge tag={data.most_preferred_item.dietary_tag} />
              </div>
            </div>
          )}
          {data.least_preferred_item && (
            <div className="flex items-start gap-4 rounded-2xl border border-coral-400/30 bg-coral-400/5 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-coral-400/10 text-coral-400">
                <AlertTriangle size={20} />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-coral-400">
                  Least preferred — postponed
                </p>
                <p className="mt-1 font-display text-lg font-semibold text-ash-100">
                  {data.least_preferred_item.name}
                </p>
                <p className="text-sm text-ash-400">
                  {data.least_preferred_item.total_votes} votes · Moved to next week
                </p>
                <DietBadge tag={data.least_preferred_item.dietary_tag} />
              </div>
            </div>
          )}
        </div>

        {/* Vote chart */}
        <div className="mt-8 rounded-2xl border border-surface-border bg-surface p-5">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ash-500">
            Top votes for week {data.voting_week}
          </h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2B2B27" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#A3A39E", fontSize: 11 }}
                  axisLine={{ stroke: "#2B2B27" }}
                  tickLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fill: "#A3A39E", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1C1C19",
                    border: "1px solid #2B2B27",
                    borderRadius: "0.75rem",
                    fontSize: "0.8rem",
                  }}
                  labelStyle={{ color: "#F5F5F4" }}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                />
                <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-ash-500">
              Leaderboard — week {data.voting_week}
            </h2>
            <div className="space-y-2">
              {data.leaderboard.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-2xl border border-surface-border bg-surface p-3"
                >
                  <span className="w-6 text-center font-mono text-xs text-ash-500">
                    #{index + 1}
                  </span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-raised text-lg">
                    {getFoodIcon(item)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="font-display text-sm font-semibold text-ash-100">
                        {item.name}
                      </h3>
                      <DietBadge tag={item.dietary_tag} />
                    </div>
                  </div>
                  <span className="font-mono text-sm font-semibold text-ash-100">
                    {item.total_votes}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-ash-500">
              <span className="inline-flex items-center gap-1.5">
                <MessageSquare size={14} />
                Recent feedback
              </span>
            </h2>
            <div className="space-y-2">
              {data.recent_feedback.length === 0 && (
                <p className="rounded-2xl border border-surface-border bg-surface p-4 text-sm text-ash-500">
                  No feedback yet.
                </p>
              )}
              {data.recent_feedback.map((f) => (
                <div
                  key={f.id}
                  className="rounded-2xl border border-surface-border bg-surface p-4"
                >
                  <p className="text-sm text-ash-200">{f.text}</p>
                  <p className="mt-1.5 font-mono text-xs text-ash-500">
                    {f.student_id} · {new Date(f.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, sub, accent = "accent" }) {
  const accentClasses = {
    accent: "bg-accent-400/10 text-accent-400",
    coral: "bg-coral-400/10 text-coral-400",
    saffron: "bg-saffron-400/10 text-saffron-400",
  };
  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-5">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${accentClasses[accent]}`}
      >
        <Icon size={18} />
      </span>
      <p className="mt-3 font-display text-2xl font-semibold text-ash-100">
        {value}
      </p>
      <p className="text-sm font-medium text-ash-300">{label}</p>
      <p className="mt-1 text-xs text-ash-500">{sub}</p>
    </div>
  );
}
