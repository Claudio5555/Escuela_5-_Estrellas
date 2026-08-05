import { Router } from 'express';
import { verificarToken, verificarMaestroODirector } from '../middlewares/auth.middleware';
import {
  registrarAsistencia,
  obtenerAsistenciaSalon,
  obtenerAsistenciaAlumno,
  actualizarAsistencia,
  resumenAsistenciaSalon
} from '../controllers/asistencia.controller';

const router = Router();

// Todas las rutas requieren autenticacion
router.use(verificarToken);

// Registrar asistencia (Maestro o Director)
router.post('/registrar', verificarMaestroODirector, registrarAsistencia);

// Obtener asistencia de un salon por fecha (Maestro o Director)
router.get('/salon/:id_salon', verificarMaestroODirector, obtenerAsistenciaSalon);

// Obtener historial de asistencia de un alumno (todos los roles autenticados)
router.get('/alumno/:id_alumno', obtenerAsistenciaAlumno);

// Actualizar un registro de asistencia (Maestro o Director)
router.put('/:id', verificarMaestroODirector, actualizarAsistencia);

// Resumen estadistico por salon (Maestro o Director)
router.get('/resumen/salon/:id_salon', verificarMaestroODirector, resumenAsistenciaSalon);

export default router;
