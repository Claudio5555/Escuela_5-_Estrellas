import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

// Reporte de asistencia diaria (todos los salones)
export const reporteAsistenciaDiaria = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fecha } = req.query;

    if (!fecha) {
      res.status(400).json({ error: 'Se requiere el parametro fecha (YYYY-MM-DD).' });
      return;
    }

    const fechaDate = new Date(fecha as string);

    const asistencias = await prisma.asistencia.findMany({
      where: { fecha: fechaDate }
    });

    const total = asistencias.length;
    const presentes = asistencias.filter(a => a.estado === 'Presente').length;
    const ausentes = asistencias.filter(a => a.estado === 'Ausente').length;
    const tardanzas = asistencias.filter(a => a.estado === 'Tardanza').length;
    const justificados = asistencias.filter(a => a.estado === 'Justificado').length;

    // Agrupar por salon
    const porSalon: Record<number, any> = {};
    for (const a of asistencias) {
      if (!porSalon[a.id_salon]) {
        porSalon[a.id_salon] = { id_salon: a.id_salon, presentes: 0, ausentes: 0, tardanzas: 0, justificados: 0, total: 0 };
      }
      porSalon[a.id_salon].total++;
      if (a.estado === 'Presente') porSalon[a.id_salon].presentes++;
      if (a.estado === 'Ausente') porSalon[a.id_salon].ausentes++;
      if (a.estado === 'Tardanza') porSalon[a.id_salon].tardanzas++;
      if (a.estado === 'Justificado') porSalon[a.id_salon].justificados++;
    }

    res.json({
      fecha: fecha,
      resumen_general: {
        total_registros: total,
        presentes,
        ausentes,
        tardanzas,
        justificados,
        porcentaje_asistencia: total > 0 ? Math.round(((presentes + tardanzas) / total) * 100) : 0
      },
      por_salon: Object.values(porSalon)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar el reporte diario.' });
  }
};

// Reporte de asistencia por salon con rango de fechas
export const reporteAsistenciaSalon = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id_salon } = req.params;
    const { desde, hasta } = req.query;

    const whereClause: any = { id_salon: Number(id_salon) };
    if (desde || hasta) {
      whereClause.fecha = {};
      if (desde) whereClause.fecha.gte = new Date(desde as string);
      if (hasta) whereClause.fecha.lte = new Date(hasta as string);
    }

    const asistencias = await prisma.asistencia.findMany({
      where: whereClause,
      orderBy: { fecha: 'asc' }
    });

    // Obtener info del salon
    const salon = await prisma.salon.findUnique({
      where: { id_salon: Number(id_salon) }
    });

    // Obtener los alumnos del salon
    const alumnos = await prisma.alumno.findMany({
      where: { id_salon: Number(id_salon) }
    });

    // Estadisticas por alumno
    const estadisticasPorAlumno = alumnos.map(alumno => {
      const asistenciasAlumno = asistencias.filter(a => a.id_alumno === alumno.id_alumno);
      const total = asistenciasAlumno.length;
      const presentes = asistenciasAlumno.filter(a => a.estado === 'Presente').length;
      const ausentes = asistenciasAlumno.filter(a => a.estado === 'Ausente').length;
      const tardanzas = asistenciasAlumno.filter(a => a.estado === 'Tardanza').length;
      const justificados = asistenciasAlumno.filter(a => a.estado === 'Justificado').length;

      return {
        id_alumno: alumno.id_alumno,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        total_dias: total,
        presentes,
        ausentes,
        tardanzas,
        justificados,
        porcentaje_asistencia: total > 0 ? Math.round(((presentes + tardanzas) / total) * 100) : 0
      };
    });

    const totalGeneral = asistencias.length;
    const presentesGeneral = asistencias.filter(a => a.estado === 'Presente').length;
    const ausentesGeneral = asistencias.filter(a => a.estado === 'Ausente').length;

    res.json({
      salon: salon ? { id_salon: salon.id_salon, grado: salon.grado, seccion: salon.seccion } : null,
      periodo: { desde: desde || 'sin limite', hasta: hasta || 'sin limite' },
      resumen: {
        total_registros: totalGeneral,
        presentes: presentesGeneral,
        ausentes: ausentesGeneral,
        porcentaje_asistencia: totalGeneral > 0 ? Math.round(((presentesGeneral + asistencias.filter(a => a.estado === 'Tardanza').length) / totalGeneral) * 100) : 0
      },
      alumnos: estadisticasPorAlumno
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar el reporte por salon.' });
  }
};

// Reporte individual de un alumno
export const reporteAlumno = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id_alumno } = req.params;
    const { desde, hasta } = req.query;

    const whereClause: any = { id_alumno: Number(id_alumno) };
    if (desde || hasta) {
      whereClause.fecha = {};
      if (desde) whereClause.fecha.gte = new Date(desde as string);
      if (hasta) whereClause.fecha.lte = new Date(hasta as string);
    }

    const asistencias = await prisma.asistencia.findMany({
      where: whereClause,
      orderBy: { fecha: 'desc' }
    });

    const alumno = await prisma.alumno.findUnique({
      where: { id_alumno: Number(id_alumno) }
    });

    const total = asistencias.length;
    const presentes = asistencias.filter(a => a.estado === 'Presente').length;
    const ausentes = asistencias.filter(a => a.estado === 'Ausente').length;
    const tardanzas = asistencias.filter(a => a.estado === 'Tardanza').length;
    const justificados = asistencias.filter(a => a.estado === 'Justificado').length;

    res.json({
      alumno: alumno ? { id_alumno: alumno.id_alumno, nombre: alumno.nombre, apellido: alumno.apellido } : null,
      periodo: { desde: desde || 'sin limite', hasta: hasta || 'sin limite' },
      estadisticas: {
        total_dias: total,
        presentes,
        ausentes,
        tardanzas,
        justificados,
        porcentaje_asistencia: total > 0 ? Math.round(((presentes + tardanzas) / total) * 100) : 0
      },
      historial: asistencias
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar el reporte del alumno.' });
  }
};

// Estadisticas generales del sistema
export const estadisticasGenerales = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalAlumnos = await prisma.alumno.count();
    const totalSalones = await prisma.salon.count();

    // Asistencia de hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const asistenciaHoy = await prisma.asistencia.findMany({
      where: { fecha: hoy }
    });

    const presentesHoy = asistenciaHoy.filter(a => a.estado === 'Presente').length;
    const ausentesHoy = asistenciaHoy.filter(a => a.estado === 'Ausente').length;
    const tardanzasHoy = asistenciaHoy.filter(a => a.estado === 'Tardanza').length;

    // Asistencia total historica
    const totalAsistencias = await prisma.asistencia.count();
    const totalPresentes = await prisma.asistencia.count({ where: { estado: 'Presente' } });
    const totalAusentes = await prisma.asistencia.count({ where: { estado: 'Ausente' } });

    res.json({
      total_alumnos: totalAlumnos,
      total_salones: totalSalones,
      asistencia_hoy: {
        total_registros: asistenciaHoy.length,
        presentes: presentesHoy,
        ausentes: ausentesHoy,
        tardanzas: tardanzasHoy,
        porcentaje: asistenciaHoy.length > 0 ? Math.round(((presentesHoy + tardanzasHoy) / asistenciaHoy.length) * 100) : 0
      },
      historico: {
        total_registros: totalAsistencias,
        presentes: totalPresentes,
        ausentes: totalAusentes,
        porcentaje_general: totalAsistencias > 0 ? Math.round((totalPresentes / totalAsistencias) * 100) : 0
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las estadisticas generales.' });
  }
};

// Alumnos con mayor numero de inasistencias
export const alumnosConMasInasistencias = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { limite } = req.query;
    const lim = Number(limite) || 10;

    const asistencias = await prisma.asistencia.findMany({
      where: { estado: 'Ausente' }
    });

    // Contar inasistencias por alumno
    const conteo: Record<number, number> = {};
    for (const a of asistencias) {
      conteo[a.id_alumno] = (conteo[a.id_alumno] || 0) + 1;
    }

    // Ordenar por mayor cantidad de inasistencias
    const ordenado = Object.entries(conteo)
      .map(([id, cantidad]) => ({ id_alumno: Number(id), inasistencias: cantidad }))
      .sort((a, b) => b.inasistencias - a.inasistencias)
      .slice(0, lim);

    // Obtener datos de los alumnos
    const alumnosIds = ordenado.map(o => o.id_alumno);
    const alumnos = await prisma.alumno.findMany({
      where: { id_alumno: { in: alumnosIds } }
    });

    const resultado = ordenado.map(o => {
      const alumno = alumnos.find(a => a.id_alumno === o.id_alumno);
      return {
        id_alumno: o.id_alumno,
        nombre: alumno ? alumno.nombre : 'Desconocido',
        apellido: alumno ? alumno.apellido : '',
        id_salon: alumno ? alumno.id_salon : null,
        inasistencias: o.inasistencias
      };
    });

    res.json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener alumnos con inasistencias.' });
  }
};
