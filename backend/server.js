require("dotenv").config();

const express = require("express");
const cors = require("cors");

const pool = require("./config/database");

const authRoutes = require("./routes/auth");
const usuarioRoutes = require("./routes/usuarios");
const qrRoutes = require("./routes/qr");
const reporteRoutes = require("./routes/reportes");
const adminRoutes = require("./routes/admin");

const app = express();

const PORT = Number(process.env.PORT || 3000);

// Validar configuración indispensable.
if (!process.env.JWT_SECRET) {
    throw new Error("Falta configurar JWT_SECRET en el archivo .env");
}

// Middlewares globales.
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173"
}));

app.use(express.json({ limit: "100kb" }));

// Ruta principal.
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "API de EkoBUAP funcionando correctamente."
    });
});

// Comprobar API y base de datos.
app.get("/api/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");

        res.json({
            success: true,
            api: "online",
            database: "connected"
        });
    } catch (error) {
        console.error("Error en health check:", error.message);

        res.status(503).json({
            success: false,
            api: "online",
            database: "disconnected"
        });
    }
});

// Rutas de la API.
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/reportes", reporteRoutes);
app.use("/api/admin", adminRoutes);

// Ruta inexistente.
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "La ruta solicitada no existe."
    });
});

// Manejo de errores inesperados de Express.
app.use((error, req, res, next) => {
    console.error("Error inesperado:", error.message);

    if (res.headersSent) {
        return next(error);
    }

    res.status(500).json({
        success: false,
        message: "Ocurrió un error interno en el servidor."
    });
});

const server = app.listen(PORT, () => {
    console.log(`EkoBUAP API ejecutándose en http://localhost:${PORT}`);
});

// Cierre ordenado de conexiones.
async function cerrarServidor() {
    console.log("Cerrando servidor EkoBUAP...");

    server.close(async () => {
        try {
            await pool.end();
            process.exit(0);
        } catch (error) {
            console.error("Error al cerrar MySQL:", error.message);
            process.exit(1);
        }
    });
}

process.on("SIGINT", cerrarServidor);
process.on("SIGTERM", cerrarServidor);