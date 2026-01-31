// plugins/axios.ts
import axios from "axios";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  const api = axios.create({
    baseURL: config.public.apiBase,
    headers: {
      "Accept": "application/json",
    },
  });

  api.interceptors.request.use((config) => {
    // Let Axios set the correct `Content-Type` for FormData (multipart boundary).
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      if (config.headers) {
        delete (config.headers as any)["Content-Type"];
      }
    } else {
      // Default JSON content-type for non-FormData requests (unless caller overrides).
      if (config.headers && !(config.headers as any)["Content-Type"]) {
        (config.headers as any)["Content-Type"] = "application/json";
      }
    }

    const token = useCookie("admin_auth_token").value;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return {
    provide: {
      axios: api,
    },
  };
});
