const pool = require("../config/database");

async function obtenerPerfil(req, res) {
    try {
        const [usuarios] = await pool.execute(
            `SELECT id, usuario, correo, rol, puntos, fecha_registro
             FROM usuarios
             WHERE id = ?
             LIMIT 1`,
            [req.usuario.id]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado."
            });
        }

        const [estadisticas] = await pool.execute(
            `SELECT
                COUNT(*) AS acciones,
                COALESCE(SUM(puntos_obtenidos), 0) AS puntos_historial
             FROM escaneos
             WHERE usuario_id = ?`,
            [req.usuario.id]
        );

        const [insignias] = await pool.execute(
            `SELECT
                i.id,
                i.nombre,
                i.descripcion,
                i.puntos_requeridos,
                ui.fecha_obtenida
             FROM usuario_insignias ui
             INNER JOIN insignias i ON i.id = ui.insignia_id
             WHERE ui.usuario_id = ?
             ORDER BY ui.fecha_obtenida DESC`,
            [req.usuario.id]
        );

        return res.json({
            success: true,
            usuario: usuarios[0],
            estadisticas: estadisticas[0],
            insignias
        });
    } catch (error) {
        console.error("Error al obtener perfil:", error.message);

        return res.status(500).json({
            success: false,
            message: "No se pudo obtener el perfil."
        });
    }
}

async function obtenerHistorial(req, res) {
    try {
        const [escaneos] = await pool.execute(
            `SELECT
                e.id,
                q.codigo,
                q.nombre,
                q.tipo,
                e.puntos_obtenidos,
                e.fecha_escaneo
             FROM escaneos e
             INNER JOIN qr_items q ON q.id = e.qr_id
             WHERE e.usuario_id = ?
             ORDER BY e.fecha_escaneo DESC
             LIMIT 100`,
            [req.usuario.id]
        );

        return res.json({
            success: true,
            total: escaneos.length,
            escaneos
        });
    } catch (error) {
        console.error("Error al obtener historial:", error.message);

        return res.status(500).json({
            success: false,
            message: "No se pudo consultar el historial."
        });
    }
}

async function obtenerInsignias(req, res) {
    try {
        const [insignias] = await pool.execute(
            `SELECT id, nombre, descripcion, puntos_requeridos
             FROM insignias
             ORDER BY puntos_requeridos ASC`
        );

        return res.json({
            success: true,
            insignias
        });
    } catch (error) {
        console.error("Error al obtener insignias:", error.message);

        return res.status(500).json({
            success: false,
            message: "No se pudieron consultar las insignias."
        });
    }
}

module.exports = {
    obtenerPerfil,
    obtenerHistorial,
    obtenerInsignias
};