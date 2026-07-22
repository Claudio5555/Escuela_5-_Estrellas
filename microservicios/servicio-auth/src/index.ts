import express, { Request, Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_key_jwt_5_estrellas_2026';

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'Servicio Auth operando correctamente' });
});

// Endpoint para Registro
app.post('/api/auth/registro', async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre_usuario, correo, contrasena, rol } = req.body;

    // Validación básica
    if (!nombre_usuario || !correo || !contrasena || !rol) {
      res.status(400).json({ error: 'Faltan campos requeridos.' });
      return;
    }

    // Verificar si el correo ya existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { correo }
    });

    if (usuarioExistente) {
      res.status(409).json({ error: 'El correo ya está registrado.' });
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
        rol
      }
    });

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      id_usuario: nuevoUsuario.id_usuario
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// Endpoint para Login
app.post('/api/auth/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      res.status(400).json({ error: 'Faltan campos requeridos.' });
      return;
    }

    const usuario = await prisma.usuario.findUnique({
      where: { correo }
    });

    if (!usuario) {
      res.status(401).json({ error: 'Credenciales inválidas.' });
      return;
    }

    // Verificar contraseña
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!contrasenaValida) {
      res.status(401).json({ error: 'Credenciales inválidas.' });
      return;
    }

    // Generar JWT
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        rol: usuario.rol
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      mensaje: 'Login exitoso',
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

const PORT = Number(process.env.PORT || 3000);
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servicio Auth corriendo en el puerto ${PORT}`);
  });
}

export default app;
