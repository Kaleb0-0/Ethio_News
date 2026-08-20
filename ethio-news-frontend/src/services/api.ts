import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

const api = axios.create({
  baseURL: BASE_URL,
});

// automatically attach JWT token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Articles ---
export const fetchArticles = async (params: { category?: string; since?: string; lang?: "eng" | "amh"; take?: number; skip?: number }) => {
  const { data } = await api.get("/ingestion", { params });
  return data;
};

// --- Auth ---
export const signUp = async (username: string | null, email: string, password: string) => {
  const { data } = await api.post("/auth/signUp", { username, email, password });
  localStorage.setItem("token", data.accessToken);
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data } = await api.post("/auth/signIn", { email, password });
  localStorage.setItem("token", data.accessToken);
  return data;
};

export const signOut = () => {
  localStorage.removeItem("token");
};

export const updateLanguage = async (lang: "eng" | "amh") => {
  const { data } = await api.patch(`/auth/${lang}`);
  return data;
};

export const toggleNotifications = async () => {
  const { data } = await api.patch("/auth/notifications");
  return data;
};

export const getMe = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};
