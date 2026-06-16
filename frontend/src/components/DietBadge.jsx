export default function DietBadge({ tag }) {
  if (tag === "non_veg") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-coral-400/30 bg-coral-400/10 px-2 py-0.5 text-xs font-medium text-coral-400">
        <span className="h-1.5 w-1.5 rounded-full bg-coral-400" />
        Non-veg
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-accent-400/30 bg-accent-400/10 px-2 py-0.5 text-xs font-medium text-accent-400">
      <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
      Veg
    </span>
  );
}
