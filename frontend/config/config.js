const CONFIG = {
    API_URL: (import.meta.env?.VITE_API_URL || "http://localhost:4000/api").replace(/\/$/, "")
};

export default CONFIG;
