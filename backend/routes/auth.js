const express = require("express");
const router = express.Router();

const {
    registrar,
    iniciarSesion,
    obtenerSesion
} = require("../controllers/authController");

const { verificarToken } = require("../middleware/auth");

router.post("/registro", registrar);
router.post("/login", iniciarSesion);
router.get("/me", verificarToken, obtenerSesion);

module.exports = router;