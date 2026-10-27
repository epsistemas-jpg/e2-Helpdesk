const CONFIG = {
    API_URL: (import.meta.env?.VITE_API_URL || (import.meta.env?.PROD
        ? "https://e2-helpdesk-1.onrender.com/api"
        : "http://localhost:4000/api")).replace(/\/$/, "")
};

export default CONFIG;
