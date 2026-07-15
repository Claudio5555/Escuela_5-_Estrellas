import { Router } from 'express';
import { verificarToken, verificarDirector } from '../middlewares/auth.middleware';
import { obtenerSalones, crearSalon, actualizarSalon, eliminarSalon, asignarMaestro } from '../controllers/salon.controller';

const router = Router();

// Todas las rutas de salones requieren autenticación
router.use(verificarToken);

// Solo el Director puede crear, actualizar, eliminar y asignar maestros (RF-04, RF-05)
router.get('/', obtenerSalones);
router.post('/', verificarDirector, crearSalon);
router.put('/:id', verificarDirector, actualizarSalon);
router.delete('/:id', verificarDirector, eliminarSalon);
router.put('/:id/maestro', verificarDirector, asignarMaestro);

export default router;
