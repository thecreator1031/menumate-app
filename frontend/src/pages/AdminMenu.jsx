import { useEffect, useState } from "react";
import { Lock, Unlock, Trash2, Plus, Star, StarOff } from "lucide-react";
import Navbar from "../components/Navbar";
import DietBadge from "../components/DietBadge";
import { api, WEEKS, MEAL_CATEGORIES } from "../api";

const CATEGORIES = [...MEAL_CATEGORIES, "staple"];
const DIET_TAGS = ["veg", "non_veg", "jain"];

const emptyForm = {
  name: "",
  description: "",
  category: "lunch",
  dietary_tag: "veg",
  cost_weight: 1,
  week: WEEKS.VOTING,
  is_staple: false,
};

export default function AdminMenu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    Promise.all([
      api.getMenu(WEEKS.SERVED),
      api.getMenu(WEEKS.VOTING),
      api.getStaples(),
    ])
      .then(([served, voting, staples]) => setItems([...served, ...voting, ...staples]))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const toggleLock = async (item) => {
    const updated = await api.adminUpdateMenuItem(item.id, {
      is_locked: !item.is_locked,
    });
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
  };

  const toggleStaple = async (item) => {
    const updated = await api.adminUpdateMenuItem(item.id, {
      is_staple: !item.is_staple,
    });
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
  };

  const remove = async (item) => {
    await api.adminDeleteMenuItem(item.id);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const created = await api.adminCreateMenuItem({
        ...form,
        cost_weight: Number(form.cost_weight),
        week: Number(form.week),
      });
      setItems((prev) => [...prev, created]);
      setForm(emptyForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const served = items.filter((i) => i.week === WEEKS.SERVED);
  const voting = items.filter((i) => i.week === WEEKS.VOTING);
  const staples = items.filter((i) => i.is_staple);

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="font-display text-3xl font-semibold text-ash-100">
          Menu setup
        </h1>
        <p className="mt-1 text-sm text-ash-400">
          Manage what's being served now, what students are voting on for
          next week, and the daily staples.
        </p>

        {error && (
          <p className="mt-4 rounded-lg border border-coral-400/30 bg-coral-400/10 px-3 py-2 text-sm text-coral-400">
            {error}
          </p>
        )}

        {loading ? (
          <div className="mt-10 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-surface-border border-t-accent-400" />
          </div>
        ) : (
          <>
            <Section title="Daily staples — always served">
              {staples.map((item) => (
                <MenuRow
                  key={item.id}
                  item={item}
                  onToggleLock={toggleLock}
                  onToggleStaple={toggleStaple}
                  onDelete={remove}
                />
              ))}
            </Section>

            <Section title={`Currently serving — week ${WEEKS.SERVED}`}>
              {served.map((item) => (
                <MenuRow
                  key={item.id}
                  item={item}
                  onToggleLock={toggleLock}
                  onToggleStaple={toggleStaple}
                  onDelete={remove}
                />
              ))}
            </Section>

            <Section title={`Voting now — week ${WEEKS.VOTING}`}>
              {voting.map((item) => (
                <MenuRow
                  key={item.id}
                  item={item}
                  onToggleLock={toggleLock}
                  onToggleStaple={toggleStaple}
                  onDelete={remove}
                />
              ))}
            </Section>

            <Section title="Add a new dish">
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
              >
                <input
                  required
                  placeholder="Dish name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm text-ash-100 placeholder:text-ash-500 focus:border-accent-400 sm:col-span-2"
                />
                <input
                  placeholder="Short description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm text-ash-100 placeholder:text-ash-500 focus:border-accent-400 sm:col-span-2"
                />
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm text-ash-100 focus:border-accent-400"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  value={form.dietary_tag}
                  onChange={(e) =>
                    setForm({ ...form, dietary_tag: e.target.value })
                  }
                  className="rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm text-ash-100 focus:border-accent-400"
                >
                  {DIET_TAGS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-ash-500">
                    Relative plate cost
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={form.cost_weight}
                    onChange={(e) =>
                      setForm({ ...form, cost_weight: e.target.value })
                    }
                    className="rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm text-ash-100 focus:border-accent-400"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-ash-500">Week</label>
                  <select
                    value={form.week}
                    onChange={(e) => setForm({ ...form, week: e.target.value })}
                    className="rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm text-ash-100 focus:border-accent-400"
                  >
                    <option value={WEEKS.STAPLE}>Daily staple (always)</option>
                    <option value={WEEKS.SERVED}>
                      Week {WEEKS.SERVED} (serving now)
                    </option>
                    <option value={WEEKS.VOTING}>
                      Week {WEEKS.VOTING} (voting)
                    </option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm text-ash-300 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={form.is_staple}
                    onChange={(e) => setForm({ ...form, is_staple: e.target.checked })}
                    className="h-4 w-4 rounded border-surface-border bg-surface accent-emerald-400"
                  />
                  Always-available daily staple (won't appear in voting)
                </label>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-400 px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-accent-200 disabled:opacity-50 sm:col-span-2"
                >
                  <Plus size={16} />
                  {submitting ? "Adding…" : "Add dish"}
                </button>
              </form>
            </Section>
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mt-8">
      <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-ash-500">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function MenuRow({ item, onToggleLock, onToggleStaple, onDelete }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-surface-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-display text-sm font-semibold text-ash-100">
          {item.name}
        </h3>
        <DietBadge tag={item.dietary_tag} />
        <span className="rounded-full bg-surface-raised px-2.5 py-1 text-xs font-medium text-ash-500">
          {item.category}
        </span>
        <span className="rounded-full bg-surface-raised px-2.5 py-1 font-mono text-xs text-ash-500">
          cost {item.cost_weight.toFixed(1)}x
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onToggleStaple(item)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            item.is_staple
              ? "border-accent-400/40 bg-accent-400/10 text-accent-400"
              : "border-surface-border text-ash-400 hover:text-ash-100"
          }`}
        >
          {item.is_staple ? <Star size={13} /> : <StarOff size={13} />}
          {item.is_staple ? "Staple" : "Not staple"}
        </button>
        <button
          onClick={() => onToggleLock(item)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            item.is_locked
              ? "border-saffron-400/40 bg-saffron-400/10 text-saffron-400"
              : "border-surface-border text-ash-400 hover:text-ash-100"
          }`}
        >
          {item.is_locked ? <Lock size={13} /> : <Unlock size={13} />}
          {item.is_locked ? "Locked" : "Unlocked"}
        </button>
        <button
          onClick={() => onDelete(item)}
          className="flex items-center justify-center rounded-lg border border-surface-border p-1.5 text-ash-400 transition-colors hover:border-coral-400/40 hover:text-coral-400"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
