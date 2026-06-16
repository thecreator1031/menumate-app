import { Heart, Lock } from "lucide-react";
import DietBadge from "./DietBadge";
import { getFoodIcon } from "../foodIcons";

export default function VoteCard({ item, onToggle, disabled }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-surface-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-raised text-2xl">
          {getFoodIcon(item)}
        </span>
        <button
          type="button"
          onClick={() => onToggle(item)}
          disabled={disabled}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            item.voted_by_me
              ? "border-accent-400/40 bg-accent-400/10 text-accent-400"
              : "border-surface-border text-ash-300 hover:border-accent-400/40 hover:text-accent-400"
          }`}
        >
          <Heart size={15} className={item.voted_by_me ? "fill-accent-400" : ""} />
          {item.voted_by_me ? "Voted" : "Vote"}
        </button>
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-base font-semibold text-ash-100">{item.name}</h3>
          <DietBadge tag={item.dietary_tag} />
          {item.is_locked && (
            <span className="inline-flex items-center gap-1 rounded-full bg-saffron-400/10 px-2.5 py-1 text-xs font-medium text-saffron-400">
              <Lock size={12} />
              Crowd favorite
            </span>
          )}
        </div>
        {item.description && (
          <p className="mt-1.5 text-sm text-ash-400">{item.description}</p>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-ash-500">
        <span>
          {item.total_votes} {item.total_votes === 1 ? "vote" : "votes"} so far
        </span>
      </div>
    </div>
  );
}
