"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var usuario_1 = require("../modelos/usuario");
var bcrypt_1 = __importDefault(require("bcrypt"));
var autenticacion_1 = __importDefault(require("../middlewares/autenticacion"));
var usuarioRoutes = express_1.Router();
//========================================================================
// Crear usuario
//========================================================================
usuarioRoutes.post('/', autenticacion_1.default, function (req, res) {
    var body = req.body;
    var usuario = new usuario_1.Usuario({
        nombre: body.nombre,
        apellido: body.apellido,
        email: body.email,
        password: bcrypt_1.default.hashSync(body.password, 10),
        rol: body.rol
    });
    usuario.save(function (err, usuarioGuardado) {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error en la base de datos',
                err: err
            });
        }
        res.status(200).json({
            ok: true,
            mensaje: 'usuario guardado',
            usuario: usuarioGuardado
        });
    });
});
//========================================================================
// Modificar usuario
//========================================================================
usuarioRoutes.put('/:id', autenticacion_1.default, function (req, res) {
    var id = req.params.id;
    var body = req.body;
    var usuariot = req.body.usuario;
    if (id !== usuariot._id) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Estos no son tus datos'
        });
    }
    usuario_1.Usuario.findById(id, function (err, usuarioActualizado) {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error en base de datos',
                err: err
            });
        }
        if (!usuarioActualizado) {
            return res.status(404).json({
                ok: false,
                mensaje: 'El usuario no existe'
            });
        }
        usuarioActualizado.nombre = body.nombre;
        usuarioActualizado.apellido = body.apellido;
        usuarioActualizado.password = bcrypt_1.default.hashSync(body.password, 10);
        usuarioActualizado.save(function (err, usuarioGuard) {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'error al actualizar',
                    err: err
                });
            }
            usuarioGuard.password = bcrypt_1.default.hashSync(body.password, 10);
            res.status(200).json({
                ok: true,
                mensaje: 'ususario actualizado correctamente',
                usuario: usuarioGuard
            });
        });
    });
});
//========================================================================
// Obtener usuario
//========================================================================
usuarioRoutes.get('/', function (req, res) {
    usuario_1.Usuario.find(function (err, usuariosDB) {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error en la base de datos',
                err: err
            });
        }
        res.status(200).json({
            ok: true,
            usuarios: usuariosDB
        });
    });
});
//========================================================================
// Borrar usuario
//========================================================================
usuarioRoutes.delete('/:id', function (req, res) {
    var id = req.params.id;
    usuario_1.Usuario.findByIdAndDelete(id, function (err, usuarioDel) {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'no se pudo borrar el usuario',
                err: err
            });
        }
        res.status(200).json({
            ok: true,
            mensaje: 'usuario eliminado exitosamente',
            usuarios: usuarioDel
        });
    });
});
//===================================================================
// Buscar usuarios con mismo nombre
//===================================================================
usuarioRoutes.post('/buscar', autenticacion_1.default, function (req, res) {
    var termino = req.body.usuario.nombre;
    var regex = new RegExp(termino, 'i');
    var admin = req.body.usuario;
    console.log(admin);
    if (admin.rol !== 'ADMIN_ROL') {
        return res.status(401).json({
            ok: false,
            mensaje: 'se necesita permiso de administrador'
        });
    }
    usuario_1.Usuario.find({ nombre: regex }, 'nombre apellido rol', function (err, usuarioDB) {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error base de datos',
                err: err
            });
        }
        if (!usuarioDB) {
            return res.status(404).json({
                ok: false,
                mensaje: 'no hay usuarios con letra n'
            });
        }
        res.status(200).json({
            ok: true,
            mensaje: 'usuarios encontrados',
            usuarios: usuarioDB.length,
            usTOTAL: usuarioDB
        });
    });
});
//===================================================================
// Buscar usuarios con el mismo apellido de quien lo busca
//===================================================================
usuarioRoutes.post('/buscar/apellido', autenticacion_1.default, function (req, res) {
    var termino = req.body.usuario.apellido;
    var regex = new RegExp(termino, 'i');
    var user = req.body.usuario;
    console.log(user);
    usuario_1.Usuario.find({ apellido: regex }, 'apellido nombre rol', function (err, usuarioAP) {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'erro en base de datos',
                err: err
            });
        }
        if (!usuarioAP) {
            return res.status(404).json({
                ok: false,
                mensaje: 'no existe otro usuario con el mismo apellido'
            });
        }
        if (user.rol !== 'USER_ROL') {
            return res.status(401).json({
                ok: false,
                mensaje: 'tu rol no concuerda con el del usuario',
            });
        }
        res.status(200).json({
            ok: true,
            Nusuarios: usuarioAP.length,
            usuarios: usuarioAP
        });
    });
});
//===================================================================
// paginacion
//===================================================================
usuarioRoutes.get('/:pagina/:Npaginas', autenticacion_1.default, function (req, res) {
    var admin = req.body.usuario;
    if (admin.rol !== 'ADMIN_ROL') {
        return res.status(401).json({
            ok: false,
            mensaje: 'no eres administrador'
        });
    }
    var pagina = req.params.pagina || 0;
    pagina = Number(pagina);
    var Npaginas = req.params.Npaginas || 2;
    Npaginas = Number(Npaginas);
    usuario_1.Usuario.find({}, 'nombre apellido email password rol') // -
        .skip(pagina)
        .limit(Npaginas)
        .exec(function (err, usuarios) {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error en la base de datos',
                err: err
            });
        }
        usuario_1.Usuario.countDocuments({}, function (err, conteo) {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'erro en el conteo',
                    err: err
                });
            }
            res.status(200).json({
                ok: true,
                total: conteo,
                usuarios: usuarios
            });
        });
    });
});
exports.default = usuarioRoutes;
