import axios from "axios";

const api = axios.create({
  baseURL: "https://ai-resume-analyser-xci6.onrender.com", // If we do not creaate this axios.create
  // Then we have to repeatedly write base url in
  // out url and withcredential part also
  withCredentials: true,
});

export async function register({ username, email, password }) {
  try {
    const response = await api.post("/api/auth/register", {
      username,
      email,
      password,
    });
    return response.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function login({ email, password }) {
  try {
    const response = await api.post("/api/auth/login", {
      email,
      password,
    });
    return response.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function logout() {
  try {
    const response = await api.get("/api/auth/logout");
    return response.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

export async function getme() {
  try {
    const response = await api.get("/api/auth/get-me");
    return response.data;
  } catch (err) {
    throw err.response?.data || err;
  }
}
