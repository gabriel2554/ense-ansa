"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var usuario_1 = require("../modelos/usuario");
var bcrypt_1 = __importDefault(require("bcrypt"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var enviroment_1 = require("../global/enviroment");
var loginRoutes = express_1.Router();
loginRoutes.post('/', function (req, res) {
    var body = req.body;
    usuario_1.Usuario.findOne({ email: body.email }, function (err, usuarioDB) {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error en la base de datos',
                err: err
            });
        }
        if (!usuarioDB) {
            return res.status(404).json({
                ok: false,
                mensaje: 'el usuario no existe'
            });
        }
        if (!bcrypt_1.default.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'credenciales incorrectas',
            });
        }
        var token = jsonwebtoken_1.default.sign({ usuario: usuarioDB }, enviroment_1.SEED, { expiresIn: 14000 });
        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token
        });
    });
});
exports.default = loginRoutes;
