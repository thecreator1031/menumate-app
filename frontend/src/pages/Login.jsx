import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../AuthContext";

export default function Login() {
  const [mode, setMode] = useState("student"); // "student" | "admin"
  const [studentId, setStudentId] = useState("");
  const [adminPin, setAdminPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    const sid = studentId.trim().toUpperCase();
    if (!sid) return;
    if (!sid.startsWith("SM")) {
      setError("Student IDs must start with 'SM' (e.g. SM2024001).");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const student = await login(sid);
      navigate("/vote");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!adminPin.trim()) return;
    setError("");
    setLoading(true);
    try {
      const student = await login("ADMIN", adminPin.trim());
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto flex max-w-md flex-col px-6 pt-16 sm:pt-24">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-400/10 text-accent-400">
          <Leaf size={22} />
        </span>
        <h1 className="mt-6 font-display text-3xl font-semibold text-ash-100">
          Log in to MenuMate
        </h1>
        <p className="mt-2 text-sm text-ash-400">
          Use your MU student ID or sign in as admin.
        </p>

        {/* Mode toggle */}
        <div className="mt-6 flex rounded-xl border border-surface-border bg-surface p-1">
          <button
            onClick={() => { setMode("student"); setError(""); }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              mode === "student"
                ? "bg-accent-400 text-ink"
                : "text-ash-400 hover:text-ash-100"
            }`}
          >
            Student Login
          </button>
          <button
            onClick={() => { setMode("admin"); setError(""); }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              mode === "admin"
                ? "bg-saffron-400 text-ink"
                : "text-ash-400 hover:text-ash-100"
            }`}
          >
            Admin Login
          </button>
        </div>

        {mode === "student" ? (
          <form onSubmit={handleStudentLogin} className="mt-6 flex flex-col gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ash-500">
                MU Student ID
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. SM2024001"
                className="w-full rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm text-ash-100 placeholder:text-ash-500 focus:border-accent-400 focus:outline-none"
              />
              <p className="mt-1 text-xs text-ash-500">Your ID starts with SM followed by your roll number</p>
            </div>
            <button
              type="submit"
              disabled={loading || !studentId.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-400 px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-accent-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Logging in…" : "Continue"}
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleAdminLogin} className="mt-6 flex flex-col gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ash-500">
                Admin PIN
              </label>
              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="Enter 4-digit PIN"
                  maxLength={4}
                  className="w-full rounded-xl border border-surface-border bg-surface px-4 py-3 pr-12 text-sm text-ash-100 placeholder:text-ash-500 focus:border-saffron-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ash-500 hover:text-ash-300"
                >
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !adminPin.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-saffron-400 px-4 py-3 text-sm font-semibold text-ink transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShieldCheck size={16} />
              {loading ? "Verifying…" : "Admin Sign In"}
            </button>
          </form>
        )}

        {error && (
          <p className="mt-3 rounded-lg border border-coral-400/30 bg-coral-400/10 px-3 py-2 text-sm text-coral-400">
            {error}
          </p>
        )}

        {mode === "student" && (
          <div className="mt-8 rounded-xl border border-surface-border bg-surface/40 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ash-500">Demo accounts</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { id: "SM2024001", name: "Aanya (Hosteller)", type: "🏠" },
                { id: "SM2024003", name: "Kabir (Day Scholar)", type: "🚌" },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setStudentId(s.id); }}
                  className="rounded-xl border border-surface-border bg-surface px-3 py-2.5 text-left transition-colors hover:border-accent-400/40"
                >
                  <p className="text-xs text-ash-500">{s.type} {s.name}</p>
                  <p className="text-sm font-medium text-ash-100">{s.id}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
