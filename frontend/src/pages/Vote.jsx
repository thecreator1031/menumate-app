import { useEffect, useMemo, useState } from "react";
import { Clock, Users, Star, CalendarOff } from "lucide-react";
import Navbar from "../components/Navbar";
import CountdownTimer from "../components/CountdownTimer";
import DietBadge from "../components/DietBadge";
import ProfileSetup from "../components/ProfileSetup";
import { getFoodIcon } from "../foodIcons";
import { api, MEAL_CATEGORIES, WEEKS } from "../api";
import { useAuth } from "../AuthContext";

const CATEGORY_LABELS = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  snacks: "Snacks",
  dinner: "Dinner",
  dessert: "Dessert",
};

function RatingStars({ value, onChange, disabled }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          disabled={disabled}
          onClick={() => onChange(star)}
          onMouseEnter={() => !disabled && setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110 disabled:cursor-default"
        >
          <Star
            size={18}
            className={`${
              (hover || value) >= star
                ? "fill-saffron-400 text-saffron-400"
                : "text-ash-600"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function Vote() {
  const { user, updateUser } = useAuth();
  const [status, setStatus] = useState(null);
  const [activeCategory, setActiveCategory] = useState(MEAL_CATEGORIES[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [myRatings, setMyRatings] = useState({});
  const [ratingStatus, setRatingStatus] = useState({});
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  // Check if profile setup is needed (freshly created account with defaults)
  useEffect(() => {
    if (user && user.role === "student") {
      // Show profile setup if pref is still at default placeholder
      const needsSetup = !user.dietary_pref || !user.student_type ||
        (user.dietary_pref === "veg" && user.student_type === "hosteller" &&
         !localStorage.getItem(`menumate_setup_done_${user.id}`));
      // We'll just always show it if not dismissed
      const done = localStorage.getItem(`menumate_setup_done_${user.id}`);
      if (!done) {
        setShowProfileSetup(true);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    api
      .getVoteStatus(user.id, WEEKS.VOTING)
      .then((data) => {
        setStatus(data);
        const firstWithItems = MEAL_CATEGORIES.find((cat) =>
          data.items.some((item) => item.category === cat)
        );
        setActiveCategory(firstWithItems || MEAL_CATEGORIES[0]);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    api.getRatings(user.id).then((ratings) => {
      const map = {};
      ratings.forEach((r) => { map[r.menu_item_id] = r.rating; });
      setMyRatings(map);
    }).catch(() => {});
  }, [user?.id]);

  const itemsByCategory = useMemo(() => {
    if (!status) return {};
    return status.items.reduce((acc, item) => {
      acc[item.category] = acc[item.category] || [];
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [status]);

  const handleVote = async (item) => {
    if (!status) return;
    try {
      const result = await api.castVote(user.id, item.id, status.week);
      setStatus((prev) => {
        const newItems = prev.items.map((i) => {
          if (i.id === item.id) {
            return { ...i, total_votes: result.total_votes, voted_by_me: result.voted_by_me };
          }
          // Remove voted_by_me from old vote if changed
          if (i.voted_by_me && result.voted_by_me) {
            return { ...i, voted_by_me: false };
          }
          return i;
        });
        const participants = newItems.some((i) => i.voted_by_me)
          ? Math.max(prev.total_participants, 1)
          : prev.total_participants;
        return { ...prev, items: newItems, my_vote_item_id: result.voted_by_me ? item.id : null, total_participants: participants };
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRate = async (item, rating) => {
    setRatingStatus((prev) => ({ ...prev, [item.id]: "saving" }));
    try {
      await api.rate(user.id, item.id, rating);
      setMyRatings((prev) => ({ ...prev, [item.id]: rating }));
      setRatingStatus((prev) => ({ ...prev, [item.id]: "saved" }));
      setTimeout(() => setRatingStatus((prev) => ({ ...prev, [item.id]: "" })), 1500);
    } catch (err) {
      setError(err.message);
      setRatingStatus((prev) => ({ ...prev, [item.id]: "" }));
    }
  };

  const handleProfileComplete = (updatedUser) => {
    localStorage.setItem(`menumate_setup_done_${updatedUser.id}`, "1");
    setShowProfileSetup(false);
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

  const votingClosed = status ? new Date(status.voting_closes_at).getTime() <= Date.now() : false;
  const isWeekendBlocked = status?.weekend_blocked;

  return (
    <div className="min-h-screen">
      <Navbar />

      {showProfileSetup && (
        <ProfileSetup onComplete={handleProfileComplete} />
      )}

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="text-center">
          <h1 className="font-display text-3xl font-semibold text-ash-100 sm:text-4xl">
            Vote & Rate
          </h1>
          <p className="mt-2 text-sm text-ash-400">
            Cast your one vote for next week's menu. Rate today's dishes too!
          </p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <DietBadge tag={user.dietary_pref} />
            <span className="rounded-full border border-surface-border bg-surface px-3 py-1 text-xs text-ash-400">
              {user.student_type === "hosteller" ? "🏠 Hosteller" : "🚌 Day Scholar"}
            </span>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-coral-400/30 bg-coral-400/10 px-3 py-2 text-sm text-coral-400">
            {error}
          </p>
        )}

        {isWeekendBlocked ? (
          <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-saffron-400/30 bg-saffron-400/5 p-10 text-center">
            <CalendarOff size={40} className="text-saffron-400" />
            <h2 className="mt-4 font-display text-xl font-semibold text-ash-100">
              Voting unavailable on weekends
            </h2>
            <p className="mt-2 max-w-sm text-sm text-ash-400">
              As a day scholar, you cannot vote on Saturday and Sunday since the mess is closed on weekends. Come back on Monday!
            </p>
          </div>
        ) : (
          <>
            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-surface-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-ash-400">
                <Clock size={16} className="text-accent-400" />
                <span>Voting ends in</span>
                {status && <CountdownTimer target={status.voting_closes_at} />}
              </div>
              <div className="flex items-center gap-2 text-sm text-ash-400">
                <Users size={16} className="text-accent-400" />
                <span>Participants</span>
                <span className="font-mono font-semibold text-ash-100">
                  {status?.total_participants} / {status?.total_students}
                </span>
              </div>
            </div>

            {status?.my_vote_item_id && (
              <div className="mt-3 rounded-xl border border-accent-400/30 bg-accent-400/5 px-4 py-3 text-sm text-accent-400">
                ✓ You've cast your vote for this week. You can change it by clicking another dish.
              </div>
            )}

            {/* Category tabs */}
            <div className="mt-6 flex flex-wrap gap-2">
              {MEAL_CATEGORIES.filter((cat) => itemsByCategory[cat]?.length).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    activeCategory === cat
                      ? "bg-accent-400 text-ink"
                      : "border border-surface-border text-ash-400 hover:text-ash-100"
                  }`}
                >
                  {CATEGORY_LABELS[cat] || cat}
                </button>
              ))}
            </div>

            {/* Vote grid */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(itemsByCategory[activeCategory] || []).map((item) => {
                const isMyVote = item.id === status?.my_vote_item_id;
                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border bg-surface p-5 transition-colors ${
                      isMyVote
                        ? "border-accent-400 bg-accent-400/5"
                        : "border-surface-border"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-raised text-xl">
                          {getFoodIcon(item)}
                        </span>
                        <div>
                          <h3 className="font-display text-sm font-semibold text-ash-100">
                            {item.name}
                          </h3>
                          <p className="text-xs text-ash-500">{item.description}</p>
                        </div>
                      </div>
                      <DietBadge tag={item.dietary_tag} />
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      {/* Vote button */}
                      <button
                        onClick={() => handleVote(item)}
                        disabled={votingClosed}
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                          isMyVote
                            ? "bg-accent-400 text-ink"
                            : "border border-surface-border text-ash-400 hover:border-accent-400/50 hover:text-ash-100"
                        }`}
                      >
                        {isMyVote ? "✓ My Vote" : "Vote"}
                        <span className="font-mono text-xs opacity-70">{item.total_votes}</span>
                      </button>

                      {/* Rating */}
                      <div className="flex flex-col items-end gap-1">
                        <RatingStars
                          value={myRatings[item.id] || 0}
                          onChange={(r) => handleRate(item, r)}
                        />
                        <span className="text-xs text-ash-500">
                          {ratingStatus[item.id] === "saving"
                            ? "Saving…"
                            : ratingStatus[item.id] === "saved"
                            ? "✓ Rated!"
                            : myRatings[item.id]
                            ? `Rated ${myRatings[item.id]}/5`
                            : "Rate this dish"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Daily staples */}
            {status?.staples && status.staples.length > 0 && (
              <div className="mt-10 rounded-2xl border border-surface-border bg-surface/60 p-6">
                <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ash-500">
                  Daily staples — always on the menu
                </h2>
                <p className="mt-1 text-sm text-ash-400">
                  Dal, rice, pulka and curd are served every day regardless of votes — no skipping these!
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {status.staples.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-xl border border-surface-border bg-surface p-3"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-raised text-lg">
                        {getFoodIcon(item)}
                      </span>
                      <div>
                        <span className="text-sm font-medium text-ash-100">{item.name}</span>
                        <div className="mt-1">
                          <RatingStars
                            value={myRatings[item.id] || 0}
                            onChange={(r) => handleRate(item, r)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-accent-400/20 bg-accent-400/5 p-4 text-center text-sm text-accent-400">
              You get one vote per week — choose the dish you most want to see next week!
            </div>
          </>
        )}
      </div>
    </div>
  );
}
