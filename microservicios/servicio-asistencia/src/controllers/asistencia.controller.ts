import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

// Registrar asistencia de multiples alumnos (un salon completo)
export const registrarAsistencia = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id_salon, fecha, registros } = req.body;

    if (!id_salon || !fecha || !registros || !Array.isArray(registros)) {
      res.status(400).json({ error: 'Se requiere id_salon, fecha y un arreglo de registros.' });
      return;
    }

    const fechaDate = new Date(fecha);

    const resultados = [];
    for (const registro of registros) {
      const { id_alumno, estado, observacion } = registro;

      if (!id_alumno || !estado) {
        continue;
      }

      const estadosValidos = ['Presente', 'Ausente', 'Tardanza', 'Justificado'];
      if (!estadosValidos.includes(estado)) {
        continue;
      }

      try {
        const asistencia = await prisma.asistencia.upsert({
          where: {
            id_alumno_fecha: {
              id_alumno: Number(id_alumno),
              fecha: fechaDate
            }
          },
          update: {
            estado,
            observacion: observacion || null,
            registrado_por: req.user.id_usuario
          },
          create: {
            id_alumno: Number(id_alumno),
            id_salon: Number(id_salon),
            fecha: fechaDate,
            estado,
            observacion: observacion || null,
            registrado_por: req.user.id_usuario
          }
        });
        resultados.push(asistencia);
      } catch (err) {
        console.error(`Error al registrar asistencia del alumno ${id_alumno}:`, err);
      }
    }

    res.status(201).json({
      mensaje: `Asistencia registrada para ${resultados.length} alumnos.`,
      registros: resultados
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar la asistencia.' });
  }
};

// Obtener asistencia de un salon por fecha
export const obtenerAsistenciaSalon = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id_salon } = req.params;
    const { fecha } = req.query;

    if (!fecha) {
      res.status(400).json({ error: 'Se requiere el parametro fecha (YYYY-MM-DD).' });
      return;
    }

    const fechaDate = new Date(fecha as string);

    const asistencias = await prisma.asistencia.findMany({
      where: {
        id_salon: Number(id_salon),
        fecha: fechaDate
      },
      orderBy: { id_alumno: 'asc' }
    });

    res.json(asistencias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la asistencia del salon.' });
  }
};

// Obtener historial de asistencia de un alumno
export const obtenerAsistenciaAlumno = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id_alumno } = req.params;
    const { desde, hasta } = req.query;

    const whereClause: any = {
      id_alumno: Number(id_alumno)
    };

    if (desde || hasta) {
      whereClause.fecha = {};
      if (desde) whereClause.fecha.gte = new Date(desde as string);
      if (hasta) whereClause.fecha.lte = new Date(hasta as string);
    }

    const asistencias = await prisma.asistencia.findMany({
      where: whereClause,
      orderBy: { fecha: 'desc' }
    });

    res.json(asistencias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la asistencia del alumno.' });
  }
};

// Actualizar un registro de asistencia individual
export const actualizarAsistencia = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { estado, observacion } = req.body;

    if (!estado) {
      res.status(400).json({ error: 'Se requiere el campo estado.' });
      return;
    }

    const estadosValidos = ['Presente', 'Ausente', 'Tardanza', 'Justificado'];
    if (!estadosValidos.includes(estado)) {
      res.status(400).json({ error: 'Estado invalido. Debe ser Presente, Ausente, Tardanza o Justificado.' });
      return;
    }

    const asistencia = await prisma.asistencia.update({
      where: { id_asistencia: Number(id) },
      data: {
        estado,
        observacion: observacion !== undefined ? observacion : undefined,
        registrado_por: req.user.id_usuario
      }
    });

    res.json(asistencia);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la asistencia.' });
  }
};

// Resumen estadistico de asistencia por salon
export const resumenAsistenciaSalon = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id_salon } = req.params;
    const { fecha } = req.query;

    const whereClause: any = { id_salon: Number(id_salon) };
    if (fecha) {
      whereClause.fecha = new Date(fecha as string);
    }

    const asistencias = await prisma.asistencia.findMany({
      where: whereClause
    });

    const total = asistencias.length;
    const presentes = asistencias.filter(a => a.estado === 'Presente').length;
    const ausentes = asistencias.filter(a => a.estado === 'Ausente').length;
    const tardanzas = asistencias.filter(a => a.estado === 'Tardanza').length;
    const justificados = asistencias.filter(a => a.estado === 'Justificado').length;

    res.json({
      id_salon: Number(id_salon),
      total_registros: total,
      presentes,
      ausentes,
      tardanzas,
      justificados,
      porcentaje_asistencia: total > 0 ? Math.round(((presentes + tardanzas) / total) * 100) : 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el resumen de asistencia.' });
  }
};
