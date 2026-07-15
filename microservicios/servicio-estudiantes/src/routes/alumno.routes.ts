import { Router } from 'express';
import { verificarToken } from '../middlewares/auth.middleware';
import { obtenerAlumnos, obtenerAlumnoPorId, crearAlumno, actualizarAlumno, eliminarAlumno } from '../controllers/alumno.controller';

const router = Router();

// Todas las rutas de alumnos requieren autenticación (Maestros y Directores pueden acceder)
router.use(verificarToken);

router.get('/', obtenerAlumnos);
router.get('/:id', obtenerAlumnoPorId);
router.post('/', crearAlumno);
router.put('/:id', actualizarAlumno);
router.delete('/:id', eliminarAlumno);

export default router;
