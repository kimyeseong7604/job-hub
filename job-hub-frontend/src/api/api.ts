// src/api/api.ts
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
  baseURL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ (선택) 토큰을 쓰는 경우: localStorage의 accessToken을 자동 첨부
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ (선택) 응답 에러 공통 처리(로그/리다이렉트 등 확장 가능)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    // 예: 401이면 토큰 삭제 같은 처리 가능
    // if (error?.response?.status === 401) localStorage.removeItem("accessToken");
    return Promise.reject(error);
  }
);

export default api;
