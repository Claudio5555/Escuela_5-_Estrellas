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
exports.asignarMaestro = exports.eliminarSalon = exports.actualizarSalon = exports.crearSalon = exports.obtenerSalones = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const obtenerSalones = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const salones = yield prisma.salon.findMany({
            include: {
                _count: {
                    select: { alumnos: true }
                }
            }
        });
        res.json(salones);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener los salones.' });
    }
});
exports.obtenerSalones = obtenerSalones;
const crearSalon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { grado, seccion, id_maestro } = req.body;
        if (!grado || !seccion || !id_maestro) {
            res.status(400).json({ error: 'Todos los campos son obligatorios.' });
            return;
        }
        const nuevoSalon = yield prisma.salon.create({
            data: { grado, seccion, id_maestro }
        });
        res.status(201).json(nuevoSalon);
    }
    catch (error) {
        if (error.code === 'P2002') {
            res.status(400).json({ error: 'Ya existe un salón con ese grado y sección.' });
        }
        else {
            res.status(500).json({ error: 'Error al crear el salón.' });
        }
    }
});
exports.crearSalon = crearSalon;
const actualizarSalon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { grado, seccion, id_maestro } = req.body;
        const salon = yield prisma.salon.update({
            where: { id_salon: Number(id) },
            data: { grado, seccion, id_maestro }
        });
        res.json(salon);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al actualizar el salón.' });
    }
});
exports.actualizarSalon = actualizarSalon;
const eliminarSalon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.salon.delete({
            where: { id_salon: Number(id) }
        });
        res.json({ mensaje: 'Salón eliminado correctamente.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al eliminar el salón.' });
    }
});
exports.eliminarSalon = eliminarSalon;
const asignarMaestro = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { id_maestro } = req.body;
        if (!id_maestro) {
            res.status(400).json({ error: 'El ID del maestro es obligatorio.' });
            return;
        }
        const salon = yield prisma.salon.update({
            where: { id_salon: Number(id) },
            data: { id_maestro }
        });
        res.json(salon);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al asignar el maestro.' });
    }
});
exports.asignarMaestro = asignarMaestro;
