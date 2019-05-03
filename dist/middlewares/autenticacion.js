"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsonwebtoken_1 = require("jsonwebtoken");
var enviroment_1 = require("../global/enviroment");
function verificatoken(req, res, next) {
    var token = req.headers.authorization;
    jsonwebtoken_1.verify(token, enviroment_1.SEED, function (err, decoded) {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'token incorrecto'
            });
        }
        req.body.usuario = decoded.usuario;
        next();
    });
}
exports.default = verificatoken;
