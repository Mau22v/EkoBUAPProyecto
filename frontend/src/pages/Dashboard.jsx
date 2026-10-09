
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Leaf,
    LogOut,
    Award,
    History,
    ScanLine,
    Recycle,
    ArrowRight
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
    const { usuario, cerrarSesion } = useAuth();
    const navigate = useNavigate();

    const [perfil, setPerfil] = useState(null);
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        async function cargarPerfil() {
            try {
                const respuesta = await api.get("/usuarios/me");
                setPerfil(respuesta.data);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "No fue posible cargar tu perfil."
                );
            } finally {
                setCargando(false);
            }
        }

        cargarPerfil();
    }, []);

    function salir() {
        cerrarSesion();
        navigate("/", { replace: true });
    }

    if (cargando) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Cargando tu espacio ecológico...</p>
            </div>
        );
    }

    const puntos = perfil?.usuario?.puntos ?? usuario?.puntos ?? 0;
    const acciones = Number(perfil?.estadisticas?.acciones ?? 0);
    const insignias = perfil?.insignias ?? [];

    const niveles = [
        { nombre: "Semilla", minimo: 0 },
        { nombre: "Brote", minimo: 50 },
        { nombre: "Árbol", minimo: 100 },
        { nombre: "Guardián", minimo: 200 }
    ];

    const nivelActual = [...niveles]
        .reverse()
        .find((nivel) => puntos >= nivel.minimo);

    const siguienteNivel = niveles.find(
        (nivel) => nivel.minimo > puntos
    );

    const progreso = siguienteNivel
        ? Math.min(
            100,
            Math.round(
                (puntos / siguienteNivel.minimo) * 100
            )
        )
        : 100;

    return (
        <main className="dashboard-page">
            <header className="dashboard-header">
                <Link to="/dashboard" className="brand dashboard-brand">
                    <div className="brand-icon">
                        <Leaf size={25} />
                    </div>
                    <h1>Eko<span>BUAP</span></h1>
                </Link>

                <button
                    className="logout-button"
                    onClick={salir}
                >
                    <LogOut size={18} />
                    Cerrar sesión
                </button>
            </header>

            <section className="dashboard-content">
                <div className="dashboard-greeting">
                    <div>
                        <p className="eyebrow">MI ESPACIO ECOLÓGICO</p>
                        <h2>¡Hola, {perfil?.usuario?.usuario || usuario?.usuario}!</h2>
                        <p>
                            Cada acción cuenta para construir un campus
                            más sustentable.
                        </p>
                    </div>

                    <div className="greeting-icon">
                        <Leaf size={35} />
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error" role="alert">
                        {error}
                    </div>
                )}

                <div className="stats-grid">
                    <article className="stat-card points-card">
                        <div className="stat-icon">
                            <Leaf size={23} />
                        </div>
                        <p>Mis puntos</p>
                        <strong>{puntos}</strong>
                        <span>Puntos ambientales</span>
                    </article>

                    <article className="stat-card">
                        <div className="stat-icon">
                            <Recycle size={23} />
                        </div>
                        <p>Mis acciones</p>
                        <strong>{acciones}</strong>
                        <span>Escaneos registrados</span>
                    </article>

                    <article className="stat-card">
                        <div className="stat-icon">
                            <Award size={23} />
                        </div>
                        <p>Mis insignias</p>
                        <strong>{insignias.length}</strong>
                        <span>Logros obtenidos</span>
                    </article>
                </div>

                <section className="panel-card progress-panel">
                    <div className="panel-heading">
                        <div>
                            <p className="eyebrow">TU PROGRESO</p>
                            <h3>Nivel {nivelActual?.nombre || "Semilla"}</h3>
                        </div>

                        <div className="level-icon">
                            <Award size={26} />
                        </div>
                    </div>

                    <div className="progress-labels">
                        <span>{puntos} puntos</span>
                        <span>
                            {siguienteNivel
                                ? `${siguienteNivel.minimo} para el siguiente nivel`
                                : "¡Nivel máximo alcanzado!"}
                        </span>
                    </div>

                    <div
                        className="progress-track"
                        role="progressbar"
                        aria-valuenow={progreso}
                        aria-valuemin="0"
                        aria-valuemax="100"
                    >
                        <div
                            className="progress-fill"
                            style={{ width: `${progreso}%` }}
                        ></div>
                    </div>
                </section>

                <div className="section-heading">
                    <div>
                        <p className="eyebrow">PARTICIPA</p>
                        <h3>¿Qué quieres hacer hoy?</h3>
                    </div>
                </div>

                <div className="action-grid">
                    <Link to="/escanear" className="action-card">
                        <div className="action-icon">
                            <ScanLine size={25} />
                        </div>
                        <h4>Escanear QR</h4>
                        <p>Registra una acción ambiental.</p>
                        <span className="action-link">
                            Comenzar <ArrowRight size={17} />
                        </span>
                    </Link>

                    <Link to="/historial" className="action-card">
                        <div className="action-icon">
                            <History size={25} />
                        </div>
                        <h4>Mi historial</h4>
                        <p>Consulta tus acciones y puntos.</p>
                        <span className="action-link">
                            Ver historial <ArrowRight size={17} />
                        </span>
                    </Link>
                </div>

                <section className="panel-card">
                    <div className="panel-heading">
                        <div>
                            <p className="eyebrow">RECONOCIMIENTOS</p>
                            <h3>Mis insignias</h3>
                        </div>
                        <Award size={24} />
                    </div>

                    {insignias.length === 0 ? (
                        <p className="empty-state">
                            Todavía no tienes insignias. ¡Realiza tu primera
                            acción para comenzar!
                        </p>
                    ) : (
                        <div className="badges-grid">
                            {insignias.map((insignia) => (
                                <div
                                    className="badge-card"
                                    key={insignia.id}
                                >
                                    <Award size={25} />
                                    <strong>{insignia.nombre}</strong>
                                    <span>{insignia.descripcion}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </section>
        </main>
    );
}