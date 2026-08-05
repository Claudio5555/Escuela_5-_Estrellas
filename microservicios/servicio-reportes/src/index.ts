import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import reportesRoutes from './routes/reportes.routes';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3003);

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/reportes', reportesRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'Servicio de Reportes operando correctamente' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servicio de Reportes corriendo en http://0.0.0.0:${PORT}`);
});
