const jwt = require("jsonwebtoken");

function verificarToken(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "No se proporcionó un token de autenticación."
        });
    }

    const token = authorization.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.usuario = {
            id: decoded.id,
            usuario: decoded.usuario,
            rol: decoded.rol
        };

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "El token es inválido o ha expirado."
        });
    }
}

function verificarAdmin(req, res, next) {
    if (!req.usuario || req.usuario.rol !== "admin") {
        return res.status(403).json({
            success: false,
            message: "No tienes permisos de administrador."
        });
    }

    next();
}

module.exports = {
    verificarToken,
    verificarAdmin
};