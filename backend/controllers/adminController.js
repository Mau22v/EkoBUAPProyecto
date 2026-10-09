const pool = require("../config/database");

async function listarUsuarios(req, res) {
    try {
        const [usuarios] = await pool.execute(
            `SELECT
                id,
                usuario,
                correo,
                rol,
                puntos,
                fecha_registro
             FROM usuarios
             ORDER BY fecha_registro DESC`
        );

        return res.json({
            success: true,
            total: usuarios.length,
            usuarios
        });
    } catch (error) {
        console.error("Error al listar usuarios:", error.message);

        return res.status(500).json({
            success: false,
            message: "No se pudieron consultar los usuarios."
        });
    }
}

module.exports = {
    listarUsuarios
};