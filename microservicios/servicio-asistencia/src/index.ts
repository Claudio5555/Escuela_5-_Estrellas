import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import asistenciaRoutes from './routes/asistencia.routes';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3002);

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/asistencia', asistenciaRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'Servicio de Asistencia operando correctamente' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servicio de Asistencia corriendo en http://0.0.0.0:${PORT}`);
});
