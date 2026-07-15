import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import salonRoutes from './routes/salon.routes';
import alumnoRoutes from './routes/alumno.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rutas base
app.use('/api/salones', salonRoutes);
app.use('/api/alumnos', alumnoRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'Servicio de Estudiantes operando correctamente' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servicio de Estudiantes corriendo en http://localhost:${PORT}`);
});
