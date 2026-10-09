
import { Link, Navigate } from "react-router-dom";
import { Leaf, LogIn, UserPlus, Recycle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Home() {
    const { usuario, cargando } = useAuth();

    if (cargando) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    if (usuario) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <main className="home-page">
            <section className="welcome-card">
                <div className="brand">
                    <div className="brand-icon">
                        <Leaf size={30} />
                    </div>

                    <h1>Eko<span>BUAP</span></h1>
                </div>

                <p className="welcome-subtitle">
                    Pequeñas acciones, grandes cambios.
                </p>

                <div className="campus-image">
                    <img
                        src="/public/campus-buap.jpeg"
                        alt="Campus universitario"
                    />

                    <div className="image-overlay">
                        <div className="eco-pill">
                            <Recycle size={16} />
                            Comunidad sustentable
                        </div>

                        <h2>Transformemos juntos nuestro entorno</h2>

                        <p>
                            Participa en el cuidado de nuestro campus
                            con acciones que cuentan.
                        </p>
                    </div>
                </div>

                <div className="welcome-actions">
                    <Link to="/login" className="button button-primary">
                        <LogIn size={19} />
                        Iniciar sesión
                    </Link>

                    <Link to="/registro" className="button button-secondary">
                        <UserPlus size={19} />
                        Registrarse
                    </Link>
                </div>

                <p className="welcome-footer">
                    Una iniciativa para una comunidad BUAP más consciente.
                </p>
            </section>
        </main>
    );
}