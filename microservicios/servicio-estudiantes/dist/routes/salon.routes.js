"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const salon_controller_1 = require("../controllers/salon.controller");
const router = (0, express_1.Router)();
// Todas las rutas de salones requieren autenticación
router.use(auth_middleware_1.verificarToken);
// Solo el Director puede crear, actualizar, eliminar y asignar maestros (RF-04, RF-05)
router.get('/', salon_controller_1.obtenerSalones);
router.post('/', auth_middleware_1.verificarDirector, salon_controller_1.crearSalon);
router.put('/:id', auth_middleware_1.verificarDirector, salon_controller_1.actualizarSalon);
router.delete('/:id', auth_middleware_1.verificarDirector, salon_controller_1.eliminarSalon);
router.put('/:id/maestro', auth_middleware_1.verificarDirector, salon_controller_1.asignarMaestro);
exports.default = router;
