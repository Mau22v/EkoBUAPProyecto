const pool = require("../config/database");

async function crearReporte(req, res) {
    try {
        const { tipo, descripcion, qr_id } = req.body;

        if (!tipo || !descripcion) {
            return res.status(400).json({
                success: false,
                message: "El tipo y la descripción son obligatorios."
            });
        }

        if (
            typeof tipo !== "string" ||
            tipo.trim().length > 100 ||
            typeof descripcion !== "string" ||
            descripcion.trim().length < 5 ||
            descripcion.trim().length > 2000
        ) {
            return res.status(400).json({
                success: false,
                message: "Revisa el tipo y la descripción del reporte."
            });
        }

        let qrId = null;

        if (qr_id !== undefined && qr_id !== null) {
            const [qr] = await pool.execute(
                `SELECT id
                 FROM qr_items
                 WHERE id = ?
                 LIMIT 1`,
                [qr_id]
            );

            if (qr.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "El elemento QR indicado no existe."
                });
            }

            qrId = qr[0].id;
        }

        const [resultado] = await pool.execute(
            `INSERT INTO reportes
                (usuario_id, qr_id, tipo, descripcion)
             VALUES (?, ?, ?, ?)`,
            [
                req.usuario.id,
                qrId,
                tipo.trim(),
                descripcion.trim()
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Reporte registrado correctamente.",
            reporte: {
                id: resultado.insertId,
                tipo: tipo.trim(),
                estado: "pendiente"
            }
        });
    } catch (error) {
        console.error("Error al crear reporte:", error.message);

        return res.status(500).json({
            success: false,
            message: "No se pudo registrar el reporte."
        });
    }
}

async function listarReportes(req, res) {
    try {
        const [reportes] = await pool.execute(
            `SELECT
                r.id,
                r.tipo,
                r.descripcion,
                r.estado,
                r.fecha_reporte,
                u.usuario,
                q.codigo AS codigo_qr,
                q.nombre AS nombre_qr
             FROM reportes r
             INNER JOIN usuarios u ON u.id = r.usuario_id
             LEFT JOIN qr_items q ON q.id = r.qr_id
             ORDER BY r.fecha_reporte DESC`
        );

        return res.json({
            success: true,
            total: reportes.length,
            reportes
        });
    } catch (error) {
        console.error("Error al listar reportes:", error.message);

        return res.status(500).json({
            success: false,
            message: "No se pudieron consultar los reportes."
        });
    }
}

async function actualizarReporte(req, res) {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const estadosPermitidos = [
            "pendiente",
            "atendido",
            "cerrado"
        ];

        if (!estadosPermitidos.includes(estado)) {
            return res.status(400).json({
                success: false,
                message: "El estado indicado no es válido."
            });
        }

        const [resultado] = await pool.execute(
            `UPDATE reportes
             SET estado = ?
             WHERE id = ?`,
            [estado, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Reporte no encontrado."
            });
        }

        return res.json({
            success: true,
            message: "Reporte actualizado correctamente."
        });
    } catch (error) {
        console.error("Error al actualizar reporte:", error.message);

        return res.status(500).json({
            success: false,
            message: "No se pudo actualizar el reporte."
        });
    }
}

module.exports = {
    crearReporte,
    listarReportes,
    actualizarReporte
};