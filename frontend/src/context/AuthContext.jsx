
import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        async function cargarSesion() {
            const token = localStorage.getItem("ekobuap_token");

            if (!token) {
                setCargando(false);
                return;
            }

            try {
                const respuesta = await api.get("/auth/me");
                setUsuario(respuesta.data.usuario);
            } catch (error) {
                localStorage.removeItem("ekobuap_token");
                setUsuario(null);
            } finally {
                setCargando(false);
            }
        }

        cargarSesion();
    }, []);

    async function registrar(datos) {
        const respuesta = await api.post("/auth/registro", datos);
        return respuesta.data;
    }

    async function iniciarSesion(datos) {
        const respuesta = await api.post("/auth/login", datos);

        localStorage.setItem(
            "ekobuap_token",
            respuesta.data.token
        );

        setUsuario(respuesta.data.usuario);

        return respuesta.data;
    }

    function cerrarSesion() {
        localStorage.removeItem("ekobuap_token");
        setUsuario(null);
    }

    return (
        <AuthContext.Provider
            value={{
                usuario,
                cargando,
                registrar,
                iniciarSesion,
                cerrarSesion,
                setUsuario
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const contexto = useContext(AuthContext);

    if (!contexto) {
        throw new Error(
            "useAuth debe utilizarse dentro de AuthProvider"
        );
    }

    return contexto;
}