const express = require("express");
const router = express.Router();

const {
    listarQR,
    escanearQR
} = require("../controllers/qrController");

const { verificarToken } = require("../middleware/auth");

router.get("/", verificarToken, listarQR);
router.post("/escanear", verificarToken, escanearQR);

module.exports = router;