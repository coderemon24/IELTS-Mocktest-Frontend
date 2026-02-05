// plugins/axios.ts
import axios from "axios";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const router = useRouter();

  const api = axios.create({
    baseURL: config.public.apiBase,
    headers: {
      "Accept": "application/json",
    },
  });

  const isAdminRequest = (url?: string) => {
    if (!url) return false;
    return url.startsWith("/admin");
  };

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

    const adminToken = useCookie("admin_auth_token").value;
    const userToken = useCookie("user_auth_token").value;
    const token = isAdminRequest(config.url) ? adminToken : userToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error?.response?.status;
      const url = error?.config?.url as string | undefined;

      if (status === 401 && process.client) {
        const currentPath = router.currentRoute.value.fullPath || "/";
        if (isAdminRequest(url)) {
          if (!router.currentRoute.value.path.startsWith("/admin/login")) {
            await navigateTo("/admin/login");
          }
        } else {
          if (!router.currentRoute.value.path.startsWith("/auth/login") && !router.currentRoute.value.path.startsWith("/login")) {
            await navigateTo(`/login?redirect=${encodeURIComponent(currentPath)}`);
          }
        }
      }

      return Promise.reject(error);
    },
  );

  return {
    provide: {
      axios: api,
    },
  };
});
