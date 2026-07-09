import request from 'supertest';
import app from '../src/index';

// Mockeamos el cliente de prisma
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    usuario: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient() as any;

describe('Microservicio Auth - Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería registrar un nuevo usuario exitosamente', async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);
    prisma.usuario.create.mockResolvedValue({ id_usuario: 1, nombre_usuario: 'Test', correo: 'test@test.com' });

    const res = await request(app).post('/api/auth/registro').send({
      nombre_usuario: 'Test',
      correo: 'test@test.com',
      contrasena: 'password123',
      rol: 'Director'
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('mensaje', 'Usuario registrado exitosamente');
  });

  it('no debería registrar si el correo ya existe', async () => {
    prisma.usuario.findUnique.mockResolvedValue({ id_usuario: 1 });

    const res = await request(app).post('/api/auth/registro').send({
      nombre_usuario: 'Test',
      correo: 'test@test.com',
      contrasena: 'password123',
      rol: 'Director'
    });

    expect(res.statusCode).toEqual(409);
    expect(res.body).toHaveProperty('error', 'El correo ya está registrado.');
  });
});
