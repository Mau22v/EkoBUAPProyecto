const express = require("express");
const router = express.Router();

const { listarUsuarios } = require("../controllers/adminController");

const {
    verificarToken,
    verificarAdmin
} = require("../middleware/auth");

router.get(
    "/usuarios",
    verificarToken,
    verificarAdmin,
    listarUsuarios
);

module.exports = router;