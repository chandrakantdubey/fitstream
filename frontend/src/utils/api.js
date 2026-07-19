const API = import.meta.env.PROD ? "/api" : "http://localhost:8000";

async function get(url) {
  const r = await fetch(API + url);
  return r.json();
}
async function post(url, body) {
  const r = await fetch(API + url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}
async function del(url) {
  const r = await fetch(API + url, { method: "DELETE" });
  return r.json();
}
async function put(url, body) {
  const r = await fetch(API + url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}

export const fetchExercises = (p = {}) =>
  get(`/exercises?${new URLSearchParams(p)}`);
export const fetchExercise = (id) => get(`/exercises/${id}`);
export const fetchFilters = () => get(`/exercises/filters/all`);
export const createWorkout = (w) => post("/workouts", w);
export const fetchWorkouts = () => get("/workouts");
export const deleteWorkout = (id) => del(`/workouts/${id}`);
export const updateWorkout = (id, w) => put(`/workouts/${id}`, w);
export const startSession = (wid) => post(`/workouts/${wid}/sessions`, {});
export const completeSession = (sid) =>
  post(`/workouts/sessions/${sid}/complete`, {});
export const logSet = (sid, data) =>
  post(`/workouts/sessions/${sid}/sets`, data);
export const fetchSessions = (wid) => get(`/workouts/${wid}/sessions`);
export const fetchStats = () => get("/progress/stats");
export const fetchHistory = (days = 30) =>
  get(`/progress/history?days=${days}`);
export const searchYouTube = (q) =>
  get(`/feed/youtube?query=${encodeURIComponent(q)}`);
export const searchTwitter = (q) =>
  get(`/feed/twitter?query=${encodeURIComponent(q)}`);
export const searchReddit = (q, sub = "fitness") =>
  get(`/feed/reddit?query=${encodeURIComponent(q)}&subreddit=${sub}`);
export const searchBilibili = (q) =>
  get(`/feed/bilibili?query=${encodeURIComponent(q)}`);
export const searchXiaohongshu = (q) =>
  get(`/feed/xiaohongshu?query=${encodeURIComponent(q)}`);
export const readWeb = (url) => get(`/feed/web?url=${encodeURIComponent(url)}`);
export const fetchRSS = (url) =>
  get(`/feed/rss?url=${encodeURIComponent(url)}`);
export const webSearch = (q) => get(`/feed/search?q=${encodeURIComponent(q)}`);
export const checkHealth = () => get("/health/doctor");
