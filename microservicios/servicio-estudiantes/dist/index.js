"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const salon_routes_1 = __importDefault(require("./routes/salon.routes"));
const alumno_routes_1 = __importDefault(require("./routes/alumno.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT || 3001);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Rutas base
app.use('/api/salones', salon_routes_1.default);
app.use('/api/alumnos', alumno_routes_1.default);
app.get('/health', (req, res) => {
    res.json({ status: 'Servicio de Estudiantes operando correctamente' });
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servicio de Estudiantes corriendo en http://0.0.0.0:${PORT}`);
});
