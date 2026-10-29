const hostname = typeof window !== "undefined" ? window.location.hostname : "";
const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
const isSeparateRenderFrontend = hostname.includes("e2-helpdesk-frontend.onrender.com");
const defaultApiUrl = isLocal
    ? "http://localhost:4000/api"
    : (isSeparateRenderFrontend ? "https://e2-helpdesk-1.onrender.com/api" : "/api");
const configuredApiUrl = import.meta.env?.VITE_API_URL?.trim();
const configuredApiIsLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(configuredApiUrl || "");
const apiUrl = !isLocal && configuredApiIsLocal ? defaultApiUrl : (configuredApiUrl || defaultApiUrl);

const CONFIG = {
    API_URL: apiUrl.replace(/\/$/, "")
};

export default CONFIG;
