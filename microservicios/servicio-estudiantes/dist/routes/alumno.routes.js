"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const alumno_controller_1 = require("../controllers/alumno.controller");
const router = (0, express_1.Router)();
// Todas las rutas de alumnos requieren autenticación (Maestros y Directores pueden acceder)
router.use(auth_middleware_1.verificarToken);
router.get('/', alumno_controller_1.obtenerAlumnos);
router.get('/:id', alumno_controller_1.obtenerAlumnoPorId);
router.post('/', alumno_controller_1.crearAlumno);
router.put('/:id', alumno_controller_1.actualizarAlumno);
router.delete('/:id', alumno_controller_1.eliminarAlumno);
exports.default = router;
