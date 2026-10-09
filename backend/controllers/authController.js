const pool = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function registrar(req, res) {
    try {
        const { usuario, correo, password } = req.body;

        if (!usuario || !correo || !password) {
            return res.status(400).json({
                success: false,
                message: "Todos los campos son obligatorios."
            });
        }

        const nombreUsuario = usuario.trim();
        const email = correo.trim().toLowerCase();

        if (nombreUsuario.length < 3 || nombreUsuario.length > 50) {
            return res.status(400).json({
                success: false,
                message: "El usuario debe tener entre 3 y 50 caracteres."
            });
        }

        const formatoUsuario = /^[a-zA-Z0-9_.-]+$/;

        if (!formatoUsuario.test(nombreUsuario)) {
            return res.status(400).json({
                success: false,
                message: "El usuario contiene caracteres no permitidos."
            });
        }

        if (email.length > 100 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: "El correo electrónico no es válido."
            });
        }

        if (typeof password !== "string" ||
            password.length < 8 ||
            password.length > 72) {
            return res.status(400).json({
                success: false,
                message: "La contraseña debe tener entre 8 y 72 caracteres."
            });
        }

        const [existentes] = await pool.execute(
            `SELECT id
             FROM usuarios
             WHERE usuario = ? OR correo = ?
             LIMIT 1`,
            [nombreUsuario, email]
        );

        if (existentes.length > 0) {
            return res.status(409).json({
                success: false,
                message: "El usuario o correo ya está registrado."
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const [resultado] = await pool.execute(
            `INSERT INTO usuarios (usuario, correo, password)
             VALUES (?, ?, ?)`,
            [nombreUsuario, email, passwordHash]
        );

        return res.status(201).json({
            success: true,
            message: "Usuario registrado correctamente.",
            usuario: {
                id: resultado.insertId,
                usuario: nombreUsuario,
                correo: email,
                rol: "usuario",
                puntos: 0
            }
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "El usuario o correo ya está registrado."
            });
        }

        console.error("Error en registro:", error.message);

        return res.status(500).json({
            success: false,
            message: "Ocurrió un error al registrar el usuario."
        });
    }
}

async function iniciarSesion(req, res) {
    try {
        const { usuario, password } = req.body;

        if (!usuario || !password) {
            return res.status(400).json({
                success: false,
                message: "Debes proporcionar usuario y contraseña."
            });
        }

        const identificador = usuario.trim();

        const [usuarios] = await pool.execute(
            `SELECT id, usuario, correo, password, rol, puntos
             FROM usuarios
             WHERE usuario = ? OR correo = ?
             LIMIT 1`,
            [
                identificador,
                identificador.toLowerCase()
            ]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Usuario o contraseña incorrectos."
            });
        }

        const usuarioEncontrado = usuarios[0];

        const passwordCorrecta = await bcrypt.compare(
            password,
            usuarioEncontrado.password
        );

        if (!passwordCorrecta) {
            return res.status(401).json({
                success: false,
                message: "Usuario o contraseña incorrectos."
            });
        }

        const token = jwt.sign(
            {
                id: usuarioEncontrado.id,
                usuario: usuarioEncontrado.usuario,
                rol: usuarioEncontrado.rol
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "2h"
            }
        );

        return res.json({
            success: true,
            message: "Inicio de sesión correcto.",
            token,
            usuario: {
                id: usuarioEncontrado.id,
                usuario: usuarioEncontrado.usuario,
                correo: usuarioEncontrado.correo,
                rol: usuarioEncontrado.rol,
                puntos: usuarioEncontrado.puntos
            }
        });
    } catch (error) {
        console.error("Error en inicio de sesión:", error.message);

        return res.status(500).json({
            success: false,
            message: "Ocurrió un error al iniciar sesión."
        });
    }
}

async function obtenerSesion(req, res) {
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
                message: "El usuario ya no existe."
            });
        }

        return res.json({
            success: true,
            usuario: usuarios[0]
        });
    } catch (error) {
        console.error("Error al consultar sesión:", error.message);

        return res.status(500).json({
            success: false,
            message: "No se pudo consultar la sesión."
        });
    }
}

module.exports = {
    registrar,
    iniciarSesion,
    obtenerSesion
};