import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const obtenerAlumnos = async (req: Request, res: Response) => {
  try {
    const { id_salon } = req.query;
    
    let whereClause = {};
    if (id_salon) {
      whereClause = { id_salon: Number(id_salon) };
    }

    const alumnos = await prisma.alumno.findMany({
      where: whereClause,
      include: {
        salon: true
      }
    });

    res.json(alumnos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los alumnos.' });
  }
};

export const obtenerAlumnoPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const alumno = await prisma.alumno.findUnique({
      where: { id_alumno: Number(id) },
      include: { salon: true }
    });

    if (!alumno) {
      res.status(404).json({ error: 'Alumno no encontrado.' });
      return;
    }

    res.json(alumno);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el alumno.' });
  }
};

export const crearAlumno = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, apellido, id_salon } = req.body;

    if (!nombre || !apellido || !id_salon) {
      res.status(400).json({ error: 'Nombre, apellido y id_salon son obligatorios.' });
      return;
    }

    // Verificar si el salón existe
    const salonExiste = await prisma.salon.findUnique({ where: { id_salon: Number(id_salon) } });
    if (!salonExiste) {
      res.status(400).json({ error: 'El salón proporcionado no existe.' });
      return;
    }

    const nuevoAlumno = await prisma.alumno.create({
      data: { nombre, apellido, id_salon: Number(id_salon) }
    });

    res.status(201).json(nuevoAlumno);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el alumno.' });
  }
};

export const actualizarAlumno = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, apellido, id_salon } = req.body;

    if (id_salon) {
      const salonExiste = await prisma.salon.findUnique({ where: { id_salon: Number(id_salon) } });
      if (!salonExiste) {
        res.status(400).json({ error: 'El salón proporcionado no existe.' });
        return;
      }
    }

    const alumno = await prisma.alumno.update({
      where: { id_alumno: Number(id) },
      data: { nombre, apellido, id_salon: id_salon ? Number(id_salon) : undefined }
    });

    res.json(alumno);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el alumno.' });
  }
};

export const eliminarAlumno = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.alumno.delete({
      where: { id_alumno: Number(id) }
    });
    res.json({ mensaje: 'Alumno eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el alumno.' });
  }
};
