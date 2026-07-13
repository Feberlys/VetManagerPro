const express = require("express");
const router = express.Router();

const {
  confirmarCita,
  recordarCita,
  avisarVacuna,
} = require("../controllers/notificacionController");

router.post("/confirmar-cita", confirmarCita);
router.post("/recordar-cita", recordarCita);
router.post("/avisar-vacuna", avisarVacuna);

module.exports = router;