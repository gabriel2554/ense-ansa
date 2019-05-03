"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var mongoose_unique_validator_1 = __importDefault(require("mongoose-unique-validator"));
var rolesValidos = {
    values: ['ADMIN_ROL', 'USER_ROL'],
    message: '{value} no es un rol valido'
};
exports.usuarioSchema = new mongoose_1.Schema({
    nombre: { type: String, required: [true, 'nombre necesario'] },
    apellido: { type: String, required: [true, 'apellido necesario'] },
    email: { type: String, unique: true, required: [true, 'correo necesario'] },
    password: { type: String, required: [true, 'contraseña necesaria'] },
    rol: { type: String, enum: rolesValidos, default: 'USER_ROL' }
}, { collection: 'usuarios' });
exports.usuarioSchema.plugin(mongoose_unique_validator_1.default, { message: '{PATH} DEBE SER UNICO!' });
exports.Usuario = mongoose_1.model("Usuario", exports.usuarioSchema);
