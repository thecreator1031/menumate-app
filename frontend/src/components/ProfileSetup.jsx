import { useState } from "react";
import { Leaf, ArrowRight } from "lucide-react";
import { api } from "../api";
import { useAuth } from "../AuthContext";

export default function ProfileSetup({ onComplete }) {
  const { user, updateUser } = useAuth();
  const [dietaryPref, setDietaryPref] = useState("");
  const [studentType, setStudentType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!dietaryPref || !studentType) return;
    setLoading(true);
    setError("");
    try {
      const updated = await api.setupProfile(user.id, dietaryPref, studentType);
      updateUser(updated);
      onComplete(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-surface-border bg-surface p-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-400/10 text-accent-400">
          <Leaf size={22} />
        </span>
        <h2 className="mt-4 font-display text-2xl font-semibold text-ash-100">
          Quick setup
        </h2>
        <p className="mt-1 text-sm text-ash-400">
          Tell us a bit about yourself so we can personalise your experience.
        </p>

        {/* Dietary preference */}
        <div className="mt-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ash-500">
            Dietary preference
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "veg", label: "🌿 Vegetarian", desc: "No meat or eggs" },
              { value: "non_veg", label: "🍗 Non-Vegetarian", desc: "Includes meat & eggs" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDietaryPref(opt.value)}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  dietaryPref === opt.value
                    ? "border-accent-400 bg-accent-400/10"
                    : "border-surface-border hover:border-accent-400/40"
                }`}
              >
                <p className="text-sm font-semibold text-ash-100">{opt.label}</p>
                <p className="mt-0.5 text-xs text-ash-500">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Student type */}
        <div className="mt-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ash-500">
            I am a
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "hosteller", label: "🏠 Hosteller", desc: "I live on campus" },
              { value: "day_scholar", label: "🚌 Day Scholar", desc: "I commute daily" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStudentType(opt.value)}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  studentType === opt.value
                    ? "border-accent-400 bg-accent-400/10"
                    : "border-surface-border hover:border-accent-400/40"
                }`}
              >
                <p className="text-sm font-semibold text-ash-100">{opt.label}</p>
                <p className="mt-0.5 text-xs text-ash-500">{opt.desc}</p>
              </button>
            ))}
          </div>
          {studentType === "day_scholar" && (
            <p className="mt-2 rounded-lg border border-saffron-400/30 bg-saffron-400/10 px-3 py-2 text-xs text-saffron-400">
              Note: Day scholars cannot vote on Saturdays and Sundays as the mess is closed on weekends.
            </p>
          )}
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-coral-400/30 bg-coral-400/10 px-3 py-2 text-sm text-coral-400">
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!dietaryPref || !studentType || loading}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-400 px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-accent-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving…" : "Get started"}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
