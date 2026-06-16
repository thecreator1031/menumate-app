import { useEffect, useState } from "react";

function getRemaining(target) {
  const diff = new Date(target).getTime() - Date.now();
  return Math.max(0, diff);
}

function format(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return { h, m, s };
}

export default function CountdownTimer({ target }) {
  const [remaining, setRemaining] = useState(() => getRemaining(target));

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const { h, m, s } = format(remaining);
  const closed = remaining <= 0;

  return (
    <span className="font-mono text-sm font-semibold text-accent-400">
      {closed ? "Voting closed" : `${h}h ${m}m ${s}s`}
    </span>
  );
}
