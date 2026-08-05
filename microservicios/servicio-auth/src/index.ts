import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_key_jwt_5_estrellas_2026';

// --- Interfaces ---
interface AuthRequest extends Request {
  user?: any;
}

// --- Middlewares de autenticacion ---
const verificarToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ error: 'Acceso denegado. No se proporciono un token.' });
    return;
  }

  try {
    const decodificado = jwt.verify(token, JWT_SECRET);
    req.user = decodificado;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Token invalido.' });
  }
};

const verificarDirector = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.rol === 'Director') {
    next();
  } else {
    res.status(403).json({ error: 'Acceso denegado. Se requiere rol de Director.' });
  }
};

// --- Health Check ---
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'Servicio Auth operando correctamente' });
});

// --- Endpoint para Registro (PROTEGIDO - solo Director) ---
app.post('/api/auth/registro', verificarToken, verificarDirector, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { nombre_usuario, correo, rol, id_alumno } = req.body;
    const contrasena = req.body.contraseña || req.body.contrasena;

    // Validacion basica
    if (!nombre_usuario || !correo || !contrasena || !rol) {
      res.status(400).json({ error: 'Faltan campos requeridos.' });
      return;
    }

    // Validar que el rol sea valido
    const rolesValidos = ['Director', 'Maestro', 'Alumno'];
    if (!rolesValidos.includes(rol)) {
      res.status(400).json({ error: 'Rol invalido. Debe ser Director, Maestro o Alumno.' });
      return;
    }

    // Verificar si el correo ya existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { correo }
    });

    if (usuarioExistente) {
      res.status(409).json({ error: 'El correo ya esta registrado.' });
      return;
    }

    // Hashear la contraseña
    const saltRounds = 10;
    const contrasenaHasheada = await bcrypt.hash(contrasena, saltRounds);

    // Crear el usuario en la BD
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre_usuario,
        correo,
        contrasena: contrasenaHasheada,
        rol,
        id_alumno: id_alumno ? Number(id_alumno) : null
      }
    });

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      id_usuario: nuevoUsuario.id_usuario,
      nombre_usuario: nuevoUsuario.nombre_usuario,
      rol: nuevoUsuario.rol
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// --- Endpoint para Login ---
app.post('/api/auth/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { correo } = req.body;
    const contrasena = req.body.contraseña || req.body.contrasena;

    if (!correo || !contrasena) {
      res.status(400).json({ error: 'Faltan campos requeridos.' });
      return;
    }

    const usuario = await prisma.usuario.findUnique({
      where: { correo }
    });

    if (!usuario) {
      res.status(401).json({ error: 'Credenciales invalidas.' });
      return;
    }

    // Verificar contraseña
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!contrasenaValida) {
      res.status(401).json({ error: 'Credenciales invalidas.' });
      return;
    }

    // Generar JWT
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        nombre_usuario: usuario.nombre_usuario,
        rol: usuario.rol,
        id_alumno: usuario.id_alumno
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre_usuario: usuario.nombre_usuario,
        correo: usuario.correo,
        rol: usuario.rol,
        id_alumno: usuario.id_alumno
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// --- Endpoint para obtener perfil del usuario autenticado ---
app.get('/api/auth/perfil', verificarToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: req.user.id_usuario },
      select: {
        id_usuario: true,
        nombre_usuario: true,
        correo: true,
        rol: true,
        id_alumno: true,
        fecha_creacion: true
      }
    });

    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado.' });
      return;
    }

    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// --- Endpoint para listar todos los usuarios (solo Director) ---
app.get('/api/auth/usuarios', verificarToken, verificarDirector, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id_usuario: true,
        nombre_usuario: true,
        correo: true,
        rol: true,
        id_alumno: true,
        fecha_creacion: true
      },
      orderBy: { fecha_creacion: 'desc' }
    });

    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// --- Endpoint para eliminar un usuario (solo Director) ---
app.delete('/api/auth/usuarios/:id', verificarToken, verificarDirector, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // No permitir que el director se elimine a si mismo
    if (Number(id) === req.user.id_usuario) {
      res.status(400).json({ error: 'No puedes eliminar tu propia cuenta.' });
      return;
    }

    await prisma.usuario.delete({
      where: { id_usuario: Number(id) }
    });

    res.json({ mensaje: 'Usuario eliminado correctamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el usuario.' });
  }
});

const PORT = Number(process.env.PORT || 3000);
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servicio Auth corriendo en el puerto ${PORT}`);
  });
}

export default app;
