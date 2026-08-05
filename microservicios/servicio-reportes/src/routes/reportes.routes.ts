import { Router } from 'express';
import { verificarToken, verificarDirector, verificarMaestroODirector } from '../middlewares/auth.middleware';
import {
  reporteAsistenciaDiaria,
  reporteAsistenciaSalon,
  reporteAlumno,
  estadisticasGenerales,
  alumnosConMasInasistencias
} from '../controllers/reportes.controller';

const router = Router();

// Todas las rutas requieren autenticacion
router.use(verificarToken);

// Reporte diario completo (solo Director)
router.get('/asistencia-diaria', verificarDirector, reporteAsistenciaDiaria);

// Reporte por salon (Maestro o Director)
router.get('/asistencia-salon/:id_salon', verificarMaestroODirector, reporteAsistenciaSalon);

// Reporte individual de alumno (todos los roles autenticados)
router.get('/alumno/:id_alumno', reporteAlumno);

// Estadisticas generales (solo Director)
router.get('/estadisticas-generales', verificarDirector, estadisticasGenerales);

// Alumnos con mas inasistencias (solo Director)
router.get('/inasistencias', verificarDirector, alumnosConMasInasistencias);

export default router;
