const express = require("express");
const router = express.Router();

const {
    obtenerPerfil,
    obtenerHistorial,
    obtenerInsignias
} = require("../controllers/usuarioController");

const { verificarToken } = require("../middleware/auth");

router.get("/me", verificarToken, obtenerPerfil);
router.get("/me/historial", verificarToken, obtenerHistorial);
router.get("/insignias", verificarToken, obtenerInsignias);

module.exports = router;