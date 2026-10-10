
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    Camera,
    CheckCircle2,
    CircleAlert,
    Leaf,
    RefreshCw,
    ScanLine,
    ShieldCheck,
    Trophy,
    XCircle
} from "lucide-react";

import { Html5Qrcode } from "html5-qrcode";
import api from "../services/api";

export default function Scanner() {
    const lectorRef = useRef(null);
    const procesandoRef = useRef(false);
    const montadoRef = useRef(false);

    const [camaraActiva, setCamaraActiva] = useState(false);
    const [procesando, setProcesando] = useState(false);
    const [codigoManual, setCodigoManual] = useState("");
    const [resultado, setResultado] = useState(null);
    const [error, setError] = useState("");
    const [aviso, setAviso] = useState("");

    const detenerCamara = useCallback(async () => {
        const lector = lectorRef.current;

        if (!lector) {
            setCamaraActiva(false);
            return;
        }

        lectorRef.current = null;

        try {
            if (lector.isScanning) {
                await lector.stop();
            }
        } catch (err) {
            console.warn("No se pudo detener la cámara:", err);
        }

        try {
            lector.clear();
        } catch (err) {
            console.warn("No se pudo limpiar el lector:", err);
        }

        if (montadoRef.current) {
            setCamaraActiva(false);
        }
    }, []);

    const registrarCodigo = useCallback(async (codigo) => {
        const codigoLimpio = codigo.trim();

        if (!codigoLimpio || procesandoRef.current) {
            return;
        }

        procesandoRef.current = true;
        setProcesando(true);
        setError("");
        setAviso("");
        setResultado(null);

        // Detenemos la cámara para impedir múltiples registros
        // mientras el backend procesa el mismo código.
        await detenerCamara();

        try {
            const respuesta = await api.post("/qr/escanear", {
                codigo: codigoLimpio
            });

            if (!montadoRef.current) {
                return;
            }

            setResultado(respuesta.data);
            setCodigoManual("");
        } catch (err) {
            if (!montadoRef.current) {
                return;
            }

            const mensaje =
                err.response?.data?.message ||
                "No fue posible registrar el escaneo. Inténtalo nuevamente.";

            if (err.response?.status === 409) {
                setAviso(mensaje);
            } else {
                setError(mensaje);
            }
        } finally {
            procesandoRef.current = false;

            if (montadoRef.current) {
                setProcesando(false);
            }
        }
    }, [detenerCamara]);

    const iniciarCamara = useCallback(async () => {
        if (lectorRef.current || procesandoRef.current) {
            return;
        }

        setError("");
        setAviso("");
        setResultado(null);

        let lector;

        try {
            // Cada inicio utiliza una instancia nueva del lector.
            lector = new Html5Qrcode("ekobuap-qr-reader");
            lectorRef.current = lector;

            await lector.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 240, height: 240 },
                    aspectRatio: 1
                },
                (textoDecodificado) => {
                    if (procesandoRef.current) {
                        return;
                    }

                    void registrarCodigo(textoDecodificado);
                },
                () => {
                    // Es normal que algunos fotogramas no contengan un QR.
                    // No mostramos errores por cada fotograma.
                }
            );

            if (montadoRef.current && lectorRef.current === lector) {
                setCamaraActiva(true);
            }
        } catch (err) {
            if (lectorRef.current === lector) {
                lectorRef.current = null;
            }

            try {
                if (lector?.isScanning) {
                    await lector.stop();
                }
            } catch {
                // Continuamos con el mensaje principal.
            }

            try {
                lector?.clear();
            } catch {
                // El lector podría no haberse inicializado.
            }

            if (montadoRef.current) {
                setCamaraActiva(false);
                setError(
                    "No se pudo iniciar la cámara. Revisa los permisos del navegador o utiliza el campo para introducir el código manualmente."
                );
            }

            console.error("Error al iniciar el lector QR:", err);
        }
    }, [registrarCodigo]);

    useEffect(() => {
        montadoRef.current = true;

        return () => {
            montadoRef.current = false;

            const lector = lectorRef.current;
            lectorRef.current = null;

            if (lector) {
                void (async () => {
                    try {
                        if (lector.isScanning) {
                            await lector.stop();
                        }
                    } catch {
                        // El componente se está desmontando.
                    }

                    try {
                        lector.clear();
                    } catch {
                        // No es necesario actualizar el estado al desmontar.
                    }
                })();
            }
        };
    }, []);

    function enviarCodigoManual(evento) {
        evento.preventDefault();

        if (!codigoManual.trim()) {
            setError("Escribe el código que contiene el QR.");
            return;
        }

        void registrarCodigo(codigoManual);
    }

    async function escanearOtro() {
        setResultado(null);
        setError("");
        setAviso("");
        setCodigoManual("");
        await iniciarCamara();
    }

    const escaneo = resultado?.escaneo;
    const insignias = resultado?.insignias ?? [];

    return (
        <main className="dashboard-page scanner-page">
            <header className="dashboard-header">
                <Link to="/dashboard" className="brand dashboard-brand">
                    <div className="brand-icon">
                        <Leaf size={25} />
                    </div>
                    <h1>Eko<span>BUAP</span></h1>
                </Link>

                <Link to="/dashboard" className="scanner-back-link">
                    <ArrowLeft size={17} />
                    Volver al dashboard
                </Link>
            </header>

            <section className="scanner-content">
                <div className="scanner-intro">
                    <div>
                        <p className="eyebrow">PARTICIPA Y SUMA PUNTOS</p>
                        <h2>Escanea un código QR</h2>
                        <p>
                            Identifica los códigos de las actividades
                            ambientales del campus y registra tus acciones
                            en EkoBUAP.
                        </p>
                    </div>

                    <div className="scanner-intro-icon">
                        <ScanLine size={34} />
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error scanner-alert" role="alert">
                        <CircleAlert size={19} />
                        <span>{error}</span>
                    </div>
                )}

                {aviso && (
                    <div className="alert scanner-alert scanner-warning" role="status">
                        <CircleAlert size={19} />
                        <span>{aviso}</span>
                    </div>
                )}

                <div className="scanner-layout">
                    <section className="panel-card scanner-camera-card">
                        <div className="panel-heading scanner-heading">
                            <div>
                                <p className="eyebrow">LECTOR DE CÓDIGOS</p>
                                <h3>Usa tu cámara</h3>
                            </div>

                            <div className="scanner-status-icon">
                                <Camera size={23} />
                            </div>
                        </div>

                        <div className="scanner-viewport">
                            <div
                                id="ekobuap-qr-reader"
                                className="scanner-reader"
                            />

                            {!camaraActiva && !procesando && !resultado && (
                                <div className="scanner-placeholder">
                                    <div className="scanner-placeholder-icon">
                                        <ScanLine size={38} />
                                    </div>
                                    <strong>Tu lector QR está listo</strong>
                                    <p>
                                        Activa la cámara y centra el código
                                        dentro del recuadro.
                                    </p>
                                </div>
                            )}

                            {procesando && (
                                <div className="scanner-processing">
                                    <div className="spinner" />
                                    <strong>Registrando tu acción...</strong>
                                    <p>Estamos verificando el código.</p>
                                </div>
                            )}
                        </div>

                        <div className="scanner-camera-actions">
                            {!camaraActiva ? (
                                <button
                                    type="button"
                                    className="button button-primary button-full"
                                    onClick={() => void iniciarCamara()}
                                    disabled={procesando}
                                >
                                    <Camera size={18} />
                                    Activar cámara
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="button button-secondary button-full"
                                    onClick={() => void detenerCamara()}
                                    disabled={procesando}
                                >
                                    <XCircle size={18} />
                                    Detener cámara
                                </button>
                            )}

                            <p className="scanner-hint">
                                <ShieldCheck size={16} />
                                Cada código válido otorga puntos según las
                                reglas de EkoBUAP.
                            </p>
                        </div>
                    </section>

                    <aside className="scanner-side">
                        <section className="panel-card scanner-manual-card">
                            <div className="panel-heading">
                                <div>
                                    <p className="eyebrow">ALTERNATIVA</p>
                                    <h3>Introducir código</h3>
                                </div>
                            </div>

                            <p className="scanner-description">
                                Si no puedes utilizar la cámara, escribe
                                exactamente el código asociado al QR.
                            </p>

                            <form
                                className="scanner-manual-form"
                                onSubmit={enviarCodigoManual}
                            >
                                <label htmlFor="codigo-qr">
                                    Código del QR
                                </label>

                                <input
                                    id="codigo-qr"
                                    type="text"
                                    value={codigoManual}
                                    onChange={(evento) =>
                                        setCodigoManual(evento.target.value)
                                    }
                                    placeholder="Ej. QR-BUAP-001"
                                    autoComplete="off"
                                    disabled={procesando}
                                />

                                <button
                                    type="submit"
                                    className="button button-primary button-full"
                                    disabled={procesando || !codigoManual.trim()}
                                >
                                    <ScanLine size={18} />
                                    Validar código
                                </button>
                            </form>
                        </section>

                        <section className="scanner-tip-card">
                            <div className="scanner-tip-icon">
                                <ShieldCheck size={22} />
                            </div>
                            <div>
                                <h4>Escaneo seguro</h4>
                                <p>
                                    El servidor verifica el código y controla
                                    que no recibas puntos más de una vez por
                                    el mismo QR durante el día.
                                </p>
                            </div>
                        </section>
                    </aside>
                </div>

                {resultado && escaneo && (
                    <section className="scanner-result panel-card" aria-live="polite">
                        <div className="scanner-result-header">
                            <div className="scanner-success-icon">
                                <CheckCircle2 size={30} />
                            </div>

                            <div>
                                <p className="eyebrow">OPERACIÓN COMPLETADA</p>
                                <h3>{resultado.message || "¡Escaneo registrado!"}</h3>
                                <p>
                                    Tu acción ambiental se registró correctamente.
                                </p>
                            </div>
                        </div>

                        <div className="scanner-result-details">
                            <div className="scanner-result-item">
                                <span>Actividad</span>
                                <strong>{escaneo.nombre}</strong>
                            </div>

                            <div className="scanner-result-item">
                                <span>Tipo</span>
                                <strong>{escaneo.tipo}</strong>
                            </div>

                            <div className="scanner-result-item scanner-points-earned">
                                <span>Puntos obtenidos</span>
                                <strong>+{escaneo.puntos_obtenidos}</strong>
                            </div>

                            <div className="scanner-result-item">
                                <span>Total acumulado</span>
                                <strong>{escaneo.puntos_totales}</strong>
                            </div>
                        </div>

                        {insignias.length > 0 && (
                            <div className="scanner-new-badges">
                                <h4>
                                    <Trophy size={19} />
                                    ¡Has conseguido una insignia!
                                </h4>

                                <div className="badges-grid">
                                    {insignias.map((insignia) => (
                                        <article
                                            className="badge-card"
                                            key={insignia.id}
                                        >
                                            <Trophy size={25} />
                                            <strong>{insignia.nombre}</strong>
                                            <span>{insignia.descripcion}</span>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            type="button"
                            className="button button-primary scanner-again-button"
                            onClick={() => void escanearOtro()}
                            disabled={procesando}
                        >
                            <RefreshCw size={18} />
                            Escanear otro QR
                        </button>
                    </section>
                )}

                <div className="scanner-footer-note">
                    <Leaf size={18} />
                    <p>
                        Cada acción cuenta. Sigue participando para acumular
                        puntos y desbloquear insignias.
                    </p>
                </div>
            </section>
        </main>
    );
}
