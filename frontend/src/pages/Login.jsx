
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Leaf, LogIn, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const { iniciarSesion } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [formulario, setFormulario] = useState({
        usuario: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    function actualizarCampo(evento) {
        const { name, value } = evento.target;

        setFormulario((actual) => ({
            ...actual,
            [name]: value
        }));
    }

    async function enviarFormulario(evento) {
        evento.preventDefault();
        setError("");
        setCargando(true);

        try {
            const resultado = await iniciarSesion(formulario);

            if (resultado.usuario.rol === "admin") {
                navigate("/admin", { replace: true });
            } else {
                navigate(location.state?.from || "/dashboard", {
                    replace: true
                });
            }
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "No fue posible iniciar sesión. Comprueba la conexión."
            );
        } finally {
            setCargando(false);
        }
    }

    return (
        <main className="auth-page">
            <section className="auth-card">
                <Link to="/" className="back-link">
                    <ArrowLeft size={18} />
                    Volver al inicio
                </Link>

                <div className="auth-brand">
                    <div className="brand-icon">
                        <Leaf size={28} />
                    </div>

                    <h1>Eko<span>BUAP</span></h1>
                </div>

                <h2>¡Qué bueno tenerte de vuelta!</h2>

                <p className="auth-description">
                    Inicia sesión y continúa sumando acciones positivas.
                </p>

                {error && (
                    <div className="alert alert-error" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={enviarFormulario}>
                    <div className="form-group">
                        <label htmlFor="usuario">
                            Usuario o correo electrónico
                        </label>

                        <input
                            id="usuario"
                            name="usuario"
                            type="text"
                            value={formulario.usuario}
                            onChange={actualizarCampo}
                            placeholder="Escribe tu usuario o correo"
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            Contraseña
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={formulario.password}
                            onChange={actualizarCampo}
                            placeholder="Escribe tu contraseña"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="button button-primary button-full"
                        disabled={cargando}
                    >
                        <LogIn size={19} />
                        {cargando ? "Iniciando sesión..." : "Iniciar sesión"}
                    </button>
                </form>

                <p className="auth-switch">
                    ¿Todavía no tienes cuenta?{" "}
                    <Link to="/registro">Regístrate aquí</Link>
                </p>
            </section>
        </main>
    );
}