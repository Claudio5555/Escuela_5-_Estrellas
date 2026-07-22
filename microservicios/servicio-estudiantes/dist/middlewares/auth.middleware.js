"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificarDirector = exports.verificarToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta_super_segura_123';
const verificarToken = (req, res, next) => {
    var _a;
    const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
    if (!token) {
        res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token.' });
        return;
    }
    try {
        const decodificado = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decodificado;
        next();
    }
    catch (error) {
        res.status(400).json({ error: 'Token inválido.' });
    }
};
exports.verificarToken = verificarToken;
const verificarDirector = (req, res, next) => {
    if (req.user && req.user.rol === 'Director') {
        next();
    }
    else {
        res.status(403).json({ error: 'Acceso denegado. Se requiere rol de Director.' });
    }
};
exports.verificarDirector = verificarDirector;
