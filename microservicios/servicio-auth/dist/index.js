"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use(express_1.default.json());
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_key_jwt_5_estrellas_2026';
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'Servicio Auth operando correctamente' });
});
// Endpoint para Registro
app.post('/api/auth/registro', async (req, res) => {
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
        const contrasenaHasheada = await bcrypt_1.default.hash(contrasena, saltRounds);
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});
// Endpoint para Login
app.post('/api/auth/login', async (req, res) => {
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
        const contrasenaValida = await bcrypt_1.default.compare(contrasena, usuario.contrasena);
        if (!contrasenaValida) {
            res.status(401).json({ error: 'Credenciales inválidas.' });
            return;
        }
        // Generar JWT
        const token = jsonwebtoken_1.default.sign({
            id_usuario: usuario.id_usuario,
            rol: usuario.rol
        }, JWT_SECRET, { expiresIn: '8h' });
        res.status(200).json({
            mensaje: 'Login exitoso',
            token
        });
    }
    catch (error) {
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
exports.default = app;
//# sourceMappingURL=index.js.map