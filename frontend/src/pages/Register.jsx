
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Leaf, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
    const { registrar } = useAuth();
    const navigate = useNavigate();

    const [formulario, setFormulario] = useState({
        usuario: "",
        correo: "",
        password: "",
        confirmarPassword: ""
    });

    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
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
        setMensaje("");

        if (formulario.password !== formulario.confirmarPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setCargando(true);

        try {
            await registrar({
                usuario: formulario.usuario,
                correo: formulario.correo,
                password: formulario.password
            });

            setMensaje("Cuenta creada correctamente. Ahora inicia sesión.");

            setTimeout(() => {
                navigate("/login", {
                    replace: true,
                    state: { registered: true }
                });
            }, 900);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "No fue posible crear la cuenta. Inténtalo nuevamente."
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

                <h2>Únete a EkoBUAP</h2>

                <p className="auth-description">
                    Crea tu cuenta y comienza a participar en acciones ambientales.
                </p>

                {error && (
                    <div className="alert alert-error" role="alert">
                        {error}
                    </div>
                )}

                {mensaje && (
                    <div className="alert alert-success" role="status">
                        {mensaje}
                    </div>
                )}

                <form onSubmit={enviarFormulario}>
                    <div className="form-group">
                        <label htmlFor="usuario">Nombre de usuario</label>

                        <input
                            id="usuario"
                            name="usuario"
                            value={formulario.usuario}
                            onChange={actualizarCampo}
                            placeholder="Ej. mauricio_22"
                            minLength={3}
                            maxLength={50}
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="correo">Correo electrónico</label>

                        <input
                            id="correo"
                            name="correo"
                            type="email"
                            value={formulario.correo}
                            onChange={actualizarCampo}
                            placeholder="correo@ejemplo.com"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={formulario.password}
                            onChange={actualizarCampo}
                            placeholder="Mínimo 8 caracteres"
                            minLength={8}
                            maxLength={72}
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmarPassword">
                            Confirmar contraseña
                        </label>

                        <input
                            id="confirmarPassword"
                            name="confirmarPassword"
                            type="password"
                            value={formulario.confirmarPassword}
                            onChange={actualizarCampo}
                            placeholder="Escribe nuevamente tu contraseña"
                            minLength={8}
                            maxLength={72}
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="button button-primary button-full"
                        disabled={cargando}
                    >
                        <UserPlus size={19} />
                        {cargando ? "Creando cuenta..." : "Crear cuenta"}
                    </button>
                </form>

                <p className="auth-switch">
                    ¿Ya tienes una cuenta?{" "}
                    <Link to="/login">Inicia sesión</Link>
                </p>
            </section>
        </main>
    );
}