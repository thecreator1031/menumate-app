import { Link } from "react-router-dom";
import {
  Leaf,
  Vote,
  BarChart3,
  Sprout,
  Star,
  ArrowRight,
} from "lucide-react";
import Navbar from "../components/Navbar";

const FEATURES = [
  {
    icon: Vote,
    title: "Vote for your favourite",
    body: "Every student gets one weekly vote — pick the dish you most want to see next week's menu.",
  },
  {
    icon: Star,
    title: "Rate every dish",
    body: "Star-rate the dishes you eat so the mess knows what's really working and what needs improving.",
  },
  {
    icon: BarChart3,
    title: "Live leaderboard",
    body: "Watch which dishes are winning the vote and see aggregated ratings from the whole hostel.",
  },
  {
    icon: Sprout,
    title: "Cut food waste",
    body: "Crowdsourced demand means less over-cooking and a smaller campus footprint.",
  },
];

const CYCLE = [
  {
    step: "01",
    title: "Vote",
    body: "Each student casts one vote per week — pick the dish you'd love to see on next week's menu.",
  },
  {
    step: "02",
    title: "Mess cooks it",
    body: "The most-voted dishes are added to next week's menu. The least preferred is postponed. The top dish won't repeat for two weeks.",
  },
  {
    step: "03",
    title: "Rate the plate",
    body: "After eating, rate each dish from 1–5 stars. Admins use this data to improve the menu over time.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pt-20 pb-16 text-center sm:pt-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-surface-border bg-surface px-4 py-1.5 text-sm text-ash-400">
          <Leaf size={14} className="text-accent-400" />
          Crowdsourced campus dining · MU
        </span>

        <h1 className="mt-8 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ash-100 sm:text-6xl lg:text-7xl">
          Your mess menu,
          <br />
          decided by everyone
          <br />
          who eats there.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ash-400">
          MenuMate lets students vote on next week's dishes and rate every plate
          — so the mess cooks what people actually want and wastes less.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-accent-400 px-6 py-3 text-sm font-semibold text-ink shadow-glow transition-transform hover:-translate-y-0.5 hover:bg-accent-200"
          >
            Start voting
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/leaderboard"
            className="inline-flex items-center gap-2 rounded-xl border border-surface-border px-6 py-3 text-sm font-semibold text-ash-100 transition-colors hover:border-ash-500"
          >
            See leaderboard
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-surface-border bg-surface p-6 transition-colors hover:border-accent-400/30"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-400/10 text-accent-400">
                <Icon size={20} />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-ash-100">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ash-400">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Weekly cycle */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-2xl border border-surface-border bg-surface/60 p-8 sm:p-12">
          <h2 className="font-display text-2xl font-semibold text-ash-100 sm:text-3xl">
            One weekly cycle, run by the people eating
          </h2>
          <p className="mt-2 max-w-2xl text-ash-400">
            Each step feeds the next — your vote shapes next week's menu, and
            your ratings keep the kitchen honest.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {CYCLE.map(({ step, title, body }) => (
              <div key={step}>
                <span className="font-mono text-sm text-accent-400">
                  {step}
                </span>
                <h3 className="mt-2 font-display text-xl font-semibold text-ash-100">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ash-400">
                  {body}
                </p>
              </div>
            ))}
          </div>

          {/* Rules summary */}
          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { icon: "🗳️", text: "One vote per student per week" },
              { icon: "📅", text: "Day scholars cannot vote on weekends" },
              { icon: "⬇️", text: "Least preferred dish moves to next week" },
              { icon: "🔄", text: "Top dish won't repeat for two weeks" },
              { icon: "🥗", text: "Dal, rice, pulka & curd served every day" },
              { icon: "♻️", text: "Food waste logged by admin only" },
            ].map(({ icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-3 rounded-xl border border-surface-border bg-surface px-4 py-3"
              >
                <span className="text-lg">{icon}</span>
                <span className="text-sm text-ash-300">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-surface-border px-6 py-8 text-center text-sm text-ash-500">
        MenuMate · Built for MU campus mess committee
      </footer>
    </div>
  );
}
