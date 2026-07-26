export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem("fitstream_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let msg = errorData.detail || `HTTP Error ${response.status}`;
    if (Array.isArray(msg) && msg.length > 0) {
      msg = msg[0].msg || "API request failed";
    }
    throw new Error(msg);
  }
  return response.json();
}

export async function loginUser(email, password) {
  return fetchApi("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
