const pool = require("../config/database");

async function listarQR(req, res) {
    try {
        const [qr] = await pool.execute(
            `SELECT
                id,
                codigo,
                tipo,
                nombre,
                descripcion,
                ubicacion,
                puntos
             FROM qr_items
             WHERE activo = TRUE
             ORDER BY tipo, nombre`
        );

        return res.json({
            success: true,
            total: qr.length,
            qr
        });
    } catch (error) {
        console.error("Error al listar QR:", error.message);

        return res.status(500).json({
            success: false,
            message: "No se pudieron consultar los códigos QR."
        });
    }
}

async function escanearQR(req, res) {
    const { codigo } = req.body;

    if (!codigo || typeof codigo !== "string") {
        return res.status(400).json({
            success: false,
            message: "Debes proporcionar el código QR."
        });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Bloqueamos la fila del usuario durante la operación.
        const [usuarios] = await connection.execute(
            `SELECT id, puntos
             FROM usuarios
             WHERE id = ?
             FOR UPDATE`,
            [req.usuario.id]
        );

        if (usuarios.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado."
            });
        }

        // Consultamos el QR directamente en la base de datos.
        const [elementos] = await connection.execute(
            `SELECT id, codigo, tipo, nombre, puntos
             FROM qr_items
             WHERE codigo = ? AND activo = TRUE
             LIMIT 1`,
            [codigo.trim()]
        );

        if (elementos.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "El QR no existe o está desactivado."
            });
        }

        const elemento = elementos[0];

        // Un mismo usuario solo recibe puntos por ese QR
        // una vez durante el día, según la fecha de MySQL.
        const [escaneosPrevios] = await connection.execute(
            `SELECT id
             FROM escaneos
             WHERE usuario_id = ?
               AND qr_id = ?
               AND fecha_escaneo >= CURDATE()
               AND fecha_escaneo < CURDATE() + INTERVAL 1 DAY
             LIMIT 1`,
            [req.usuario.id, elemento.id]
        );

        if (escaneosPrevios.length > 0) {
            await connection.rollback();

            return res.status(409).json({
                success: false,
                message: "Ya registraste este QR el día de hoy."
            });
        }

        const puntos = elemento.puntos;

        await connection.execute(
            `INSERT INTO escaneos
                (usuario_id, qr_id, puntos_obtenidos)
             VALUES (?, ?, ?)`,
            [req.usuario.id, elemento.id, puntos]
        );

        await connection.execute(
            `UPDATE usuarios
             SET puntos = puntos + ?
             WHERE id = ?`,
            [puntos, req.usuario.id]
        );

        const [actualizacion] = await connection.execute(
            `SELECT puntos
             FROM usuarios
             WHERE id = ?`,
            [req.usuario.id]
        );

        const puntosActuales = actualizacion[0].puntos;

        // Concedemos las insignias cuyos requisitos se cumplen.
        await connection.execute(
            `INSERT IGNORE INTO usuario_insignias
                (usuario_id, insignia_id)
             SELECT ?, id
             FROM insignias
             WHERE puntos_requeridos <= ?`,
            [req.usuario.id, puntosActuales]
        );

        const [insigniasNuevas] = await connection.execute(
            `SELECT id, nombre, descripcion
             FROM insignias
             WHERE id IN (
                SELECT insignia_id
                FROM usuario_insignias
                WHERE usuario_id = ?
                  AND fecha_obtenida >= NOW() - INTERVAL 1 MINUTE
             )`,
            [req.usuario.id]
        );

        await connection.commit();

        return res.status(201).json({
            success: true,
            message: "Escaneo registrado correctamente.",
            escaneo: {
                codigo: elemento.codigo,
                nombre: elemento.nombre,
                tipo: elemento.tipo,
                puntos_obtenidos: puntos,
                puntos_totales: puntosActuales
            },
            insignias: insigniasNuevas
        });
    } catch (error) {
        await connection.rollback();

        console.error("Error al registrar escaneo:", error.message);

        return res.status(500).json({
            success: false,
            message: "No se pudo registrar el escaneo."
        });
    } finally {
        connection.release();
    }
}

module.exports = {
    listarQR,
    escanearQR
};