const express = require("express");
const router = express.Router();

const {
    crearReporte,
    listarReportes,
    actualizarReporte
} = require("../controllers/reporteController");

const {
    verificarToken,
    verificarAdmin
} = require("../middleware/auth");

router.post("/", verificarToken, crearReporte);

router.get(
    "/",
    verificarToken,
    verificarAdmin,
    listarReportes
);

router.patch(
    "/:id",
    verificarToken,
    verificarAdmin,
    actualizarReporte
);

module.exports = router;