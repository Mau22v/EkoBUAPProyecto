
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ admin = false }) {
    const { usuario, cargando } = useAuth();
    const location = useLocation();

    if (cargando) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Preparando tu espacio EkoBUAP...</p>
            </div>
        );
    }

    if (!usuario) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location.pathname }}
            />
        );
    }

    if (admin && usuario.rol !== "admin") {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}