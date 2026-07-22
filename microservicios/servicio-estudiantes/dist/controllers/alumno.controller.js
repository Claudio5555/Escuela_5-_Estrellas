"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarAlumno = exports.actualizarAlumno = exports.crearAlumno = exports.obtenerAlumnoPorId = exports.obtenerAlumnos = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const obtenerAlumnos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id_salon } = req.query;
        let whereClause = {};
        if (id_salon) {
            whereClause = { id_salon: Number(id_salon) };
        }
        const alumnos = yield prisma.alumno.findMany({
            where: whereClause,
            include: {
                salon: true
            }
        });
        res.json(alumnos);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener los alumnos.' });
    }
});
exports.obtenerAlumnos = obtenerAlumnos;
const obtenerAlumnoPorId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const alumno = yield prisma.alumno.findUnique({
            where: { id_alumno: Number(id) },
            include: { salon: true }
        });
        if (!alumno) {
            res.status(404).json({ error: 'Alumno no encontrado.' });
            return;
        }
        res.json(alumno);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener el alumno.' });
    }
});
exports.obtenerAlumnoPorId = obtenerAlumnoPorId;
const crearAlumno = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nombre, apellido, id_salon } = req.body;
        if (!nombre || !apellido || !id_salon) {
            res.status(400).json({ error: 'Nombre, apellido y id_salon son obligatorios.' });
            return;
        }
        // Verificar si el salón existe
        const salonExiste = yield prisma.salon.findUnique({ where: { id_salon: Number(id_salon) } });
        if (!salonExiste) {
            res.status(400).json({ error: 'El salón proporcionado no existe.' });
            return;
        }
        const nuevoAlumno = yield prisma.alumno.create({
            data: { nombre, apellido, id_salon: Number(id_salon) }
        });
        res.status(201).json(nuevoAlumno);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al crear el alumno.' });
    }
});
exports.crearAlumno = crearAlumno;
const actualizarAlumno = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { nombre, apellido, id_salon } = req.body;
        if (id_salon) {
            const salonExiste = yield prisma.salon.findUnique({ where: { id_salon: Number(id_salon) } });
            if (!salonExiste) {
                res.status(400).json({ error: 'El salón proporcionado no existe.' });
                return;
            }
        }
        const alumno = yield prisma.alumno.update({
            where: { id_alumno: Number(id) },
            data: { nombre, apellido, id_salon: id_salon ? Number(id_salon) : undefined }
        });
        res.json(alumno);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al actualizar el alumno.' });
    }
});
exports.actualizarAlumno = actualizarAlumno;
const eliminarAlumno = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.alumno.delete({
            where: { id_alumno: Number(id) }
        });
        res.json({ mensaje: 'Alumno eliminado correctamente.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al eliminar el alumno.' });
    }
});
exports.eliminarAlumno = eliminarAlumno;
