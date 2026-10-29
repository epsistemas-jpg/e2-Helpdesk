const hostname = typeof window !== "undefined" ? window.location.hostname : "";
const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
const isSeparateRenderFrontend = hostname.includes("e2-helpdesk-frontend.onrender.com");
const defaultApiUrl = isLocal
    ? "http://localhost:4000/api"
    : (isSeparateRenderFrontend ? "https://e2-helpdesk-1.onrender.com/api" : "/api");

const CONFIG = {
    API_URL: (import.meta.env?.VITE_API_URL || defaultApiUrl).replace(/\/$/, "")
};

export default CONFIG;
