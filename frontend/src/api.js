const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    let detail = "Something went wrong";
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }

  return res.json();
}

export const api = {
  login: (studentId, pin) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ student_id: studentId, pin }),
    }),

  setupProfile: (studentId, dietary_pref, student_type) =>
    request("/api/auth/setup-profile", {
      method: "POST",
      body: JSON.stringify({ student_id: studentId, dietary_pref, student_type }),
    }),

  getMenu: (week, category) => {
    const params = new URLSearchParams();
    if (week !== undefined) params.set("week", week);
    if (category) params.set("category", category);
    return request(`/api/menu?${params.toString()}`);
  },

  getStaples: () => request("/api/staples"),

  getVotingWindow: (week) => request(`/api/voting-window?week=${week}`),

  adminUpdateVotingWindow: (payload) =>
    request("/api/admin/voting-window", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  getVoteStatus: (studentId, week) =>
    request(`/api/votes/${studentId}?week=${week}`),

  castVote: (studentId, menuItemId, week) =>
    request("/api/votes/cast", {
      method: "POST",
      body: JSON.stringify({ student_id: studentId, menu_item_id: menuItemId, week }),
    }),

  getLeaderboard: (week) => request(`/api/leaderboard?week=${week}`),

  rate: (studentId, menuItemId, rating) =>
    request("/api/rate", {
      method: "POST",
      body: JSON.stringify({ student_id: studentId, menu_item_id: menuItemId, rating }),
    }),

  getRatings: (studentId) => request(`/api/ratings/${studentId}`),

  submitFeedback: (studentId, text) =>
    request("/api/feedback", {
      method: "POST",
      body: JSON.stringify({ student_id: studentId, text }),
    }),

  adminGetFeedback: () => request("/api/admin/feedback"),

  adminCreateMenuItem: (item) =>
    request("/api/admin/menu", {
      method: "POST",
      body: JSON.stringify(item),
    }),

  adminUpdateMenuItem: (id, payload) =>
    request(`/api/admin/menu/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  adminDeleteMenuItem: (id) =>
    request(`/api/admin/menu/${id}`, { method: "DELETE" }),

  adminGetWaste: (week) => request(`/api/admin/waste?week=${week}`),

  adminLogWaste: (payload) =>
    request("/api/admin/waste", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  adminGetSustainability: (week) => request(`/api/admin/sustainability?week=${week}`),

  adminDashboard: () => request("/api/admin/dashboard"),
};

export const WEEKS = {
  SERVED: 1,
  VOTING: 2,
  STAPLE: 0,
};

export const MEAL_CATEGORIES = ["breakfast", "lunch", "snacks", "dinner", "dessert"];
