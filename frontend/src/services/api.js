
import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 10000
});

// Añade el token de sesión a las solicitudes autenticadas.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("ekobuap_token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;