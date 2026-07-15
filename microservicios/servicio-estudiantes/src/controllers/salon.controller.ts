import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const obtenerSalones = async (req: Request, res: Response) => {
  try {
    const salones = await prisma.salon.findMany({
      include: {
        _count: {
          select: { alumnos: true }
        }
      }
    });
    res.json(salones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los salones.' });
  }
};

export const crearSalon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { grado, seccion, id_maestro } = req.body;
    
    if (!grado || !seccion || !id_maestro) {
      res.status(400).json({ error: 'Todos los campos son obligatorios.' });
      return;
    }

    const nuevoSalon = await prisma.salon.create({
      data: { grado, seccion, id_maestro }
    });

    res.status(201).json(nuevoSalon);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Ya existe un salón con ese grado y sección.' });
    } else {
      res.status(500).json({ error: 'Error al crear el salón.' });
    }
  }
};

export const actualizarSalon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { grado, seccion, id_maestro } = req.body;

    const salon = await prisma.salon.update({
      where: { id_salon: Number(id) },
      data: { grado, seccion, id_maestro }
    });

    res.json(salon);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el salón.' });
  }
};

export const eliminarSalon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.salon.delete({
      where: { id_salon: Number(id) }
    });
    res.json({ mensaje: 'Salón eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el salón.' });
  }
};

export const asignarMaestro = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { id_maestro } = req.body;

    if (!id_maestro) {
      res.status(400).json({ error: 'El ID del maestro es obligatorio.' });
      return;
    }

    const salon = await prisma.salon.update({
      where: { id_salon: Number(id) },
      data: { id_maestro }
    });

    res.json(salon);
  } catch (error) {
    res.status(500).json({ error: 'Error al asignar el maestro.' });
  }
};
