import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_key_jwt_5_estrellas_2026';

export interface AuthRequest extends Request {
  user?: any;
}

export const verificarToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
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

export const verificarDirector = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.rol === 'Director') {
    next();
  } else {
    res.status(403).json({ error: 'Acceso denegado. Se requiere rol de Director.' });
  }
};

export const verificarMaestroODirector = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && (req.user.rol === 'Maestro' || req.user.rol === 'Director')) {
    next();
  } else {
    res.status(403).json({ error: 'Acceso denegado. Se requiere rol de Maestro o Director.' });
  }
};
