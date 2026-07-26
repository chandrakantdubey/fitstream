const API = import.meta.env.PROD ? "/api" : "http://localhost:8000";

export async function apiRequest(url, options = {}) {
  const { auth = true, body, headers, ...rest } = options;
  const token = localStorage.getItem("token");
  const requestHeaders = {
    ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const r = await fetch(API + url, {
    ...rest,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await r.text();
  const data = text ? JSON.parse(text) : null;

  if (!r.ok) {
    throw new Error(data?.detail || data?.error || `Request failed: ${r.status}`);
  }

  return data;
}

const get = (url, options) => apiRequest(url, { ...options, method: "GET" });
const post = (url, body, options) =>
  apiRequest(url, { ...options, method: "POST", body });
const del = (url, options) => apiRequest(url, { ...options, method: "DELETE" });
const put = (url, body, options) =>
  apiRequest(url, { ...options, method: "PUT", body });

export const fetchExercises = (p = {}) =>
  get(`/exercises?${new URLSearchParams(p)}`);
export const fetchExercise = (id) => get(`/exercises/${id}`);
export const fetchFilters = () => get(`/exercises/filters/all`);
export const registerUser = (data) => post("/auth/register", data, { auth: false });
export const loginUser = (data) => post("/auth/login", data, { auth: false });
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
export const fetchPrograms = () => get("/programs");
export const createProgram = (program) => post("/programs", program);
export const deleteProgram = (id) => del(`/programs/${id}`);
export const fetchActiveProgram = () => get("/programs/enrolled/active");
export const enrollProgram = (programId) =>
  post("/programs/enroll", { program_id: programId });
export const updateProgramProgress = (userProgramId, week, day) =>
  put(`/programs/enrolled/${userProgramId}/progress?week=${week}&day=${day}`);
export const fetchActiveGoals = () => get("/goals/active");
export const fetchRecords = () => get("/goals/records");
export const createGoal = (goal) => post("/goals", goal);
export const updateGoalProgress = (goalId, currentValue) =>
  post(`/goals/${goalId}/progress?current_value=${currentValue}`, {});
export const fetchCalendar = (year, month) =>
  get(`/schedule/calendar?year=${year}&month=${month}`);
export const fetchUpcomingWorkouts = () => get("/schedule/workouts/upcoming");
export const scheduleWorkout = (data) => post("/schedule/workouts", data);
export const completeScheduledWorkout = (scheduledId) =>
  put(`/schedule/workouts/${scheduledId}/complete`);
export const skipScheduledWorkout = (scheduledId, reason = "Skipped") =>
  put(`/schedule/workouts/${scheduledId}/skip?reason=${encodeURIComponent(reason)}`);
export const fetchBodyMetrics = () => get("/body-metrics");
export const fetchWeightSummary = () => get("/body-metrics/summary/weight");
export const createBodyMetric = (metric) => post("/body-metrics", metric);
export const exportData = () => get("/export/full");
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
