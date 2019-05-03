import {Router, Request, Response } from 'express';
import Server from '../clases/server';
import {Usuario} from '../modelos/usuario';
import { IUsuario } from '../interfaces/usuario';
import bcrypt  from 'bcrypt'
import verificatoken from '../middlewares/autenticacion';
import { error } from 'util';

const usuarioRoutes = Router();

//========================================================================
// Crear usuario
//========================================================================
usuarioRoutes.post('/', verificatoken, (req: Request, res: Response) => {

const body: IUsuario = req.body;
const usuario = new Usuario ({
    nombre: body.nombre,
    apellido: body.apellido,
    email: body.email,
    password: bcrypt.hashSync(body.password,10),
    rol: body.rol
});

usuario.save((err:any, usuarioGuardado) => {
    if (err) {
        return res.status(500).json({
            ok:false,
            mensaje:'error en la base de datos',
            err:err
        });
    }

    res.status(200).json({
        ok:true,
        mensaje: 'usuario guardado',
        usuario: usuarioGuardado
    });
});

});

//========================================================================
// Modificar usuario
//========================================================================
usuarioRoutes.put('/:id',verificatoken, (req: Request, res: Response) => {
    const id = req.params.id;
    const body = req.body;
    const usuariot = req.body.usuario;

    if (id !== usuariot._id){
        return res.status(400).json({
            ok: false,
            mensaje: 'Estos no son tus datos'
        });
    }
    
    
    Usuario.findById(id, (err, usuarioActualizado) => {
       
        
        if (err) {
            return res.status(500).json({
                ok:false,
                mensaje: 'error en base de datos',
                err:err
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
        usuarioActualizado.password = bcrypt.hashSync(body.password,10);
        

        usuarioActualizado.save(  (err,usuarioGuard) => {
            
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje:'error al actualizar',
                    err:err
                });
            }
            usuarioGuard.password = bcrypt.hashSync(body.password,10)

            res.status(200).json({
                ok: true,
                mensaje: 'ususario actualizado correctamente',
                usuario:usuarioGuard
            });
        });

    });
});

//========================================================================
// Obtener usuario
//========================================================================
usuarioRoutes.get('/', (req: Request, res: Response) => {


    Usuario.find(  (err:any, usuariosDB) =>{
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
    } );

});

//========================================================================
// Borrar usuario
//========================================================================
usuarioRoutes.delete('/:id', (req: Request, res: Response) => {

    const id = req.params.id;

        Usuario.findByIdAndDelete(id, (err, usuarioDel) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'no se pudo borrar el usuario',
                    err:err
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
usuarioRoutes.post('/buscar', verificatoken, (req:Request, res:Response) =>{
    const termino:any =req.body.usuario.nombre;
    let regex =new RegExp(termino, 'i');
    const admin = req.body.usuario;
    console.log(admin)

    if ( admin.rol !== 'ADMIN_ROL' ) {
        return res.status(401).json({
            ok: false,
            mensaje: 'se necesita permiso de administrador'
        });
    }

    Usuario.find({nombre:regex}, 'nombre', (err:any, usuarioDB)=> {
        if (err) {
           return res.status(500).json({
                ok: false,
                mensaje: 'error base de datos',
                err:err
            });
        }
        if (!usuarioDB){
            return res.status(404).json({ 
                ok: false,
                mensaje: 'no hay usuarios con letra n'
                
            })
        }
        res.status(200).json({
            ok:true,
            mensaje: 'usuarios encontrados',
            usuarios: usuarioDB.length,
            usTOTAL: usuarioDB
        });
    });
});

//===================================================================
// Buscar usuarios con el mismo apellido de quien lo busca
//===================================================================
usuarioRoutes.post('/buscar/apellido', verificatoken, (req:Request, res:Response) =>{

    const termino:any =req.body.usuario.apellido;
    let regex =new RegExp(termino, 'i');
    const user = req.body.usuario;
    console.log(user);


    Usuario.find( {apellido:regex},'apellido', (err:any,usuarioAP) =>{
        if (err) {
            return res.status(500).json({
                ok:false,
                mensaje: 'erro en base de datos',
                err:err
            });

        }

        if (!usuarioAP){
            return res.status(404).json({
                ok:false,
                mensaje: 'no existe otro usuario con el mismo apellido'
            });
        }

        if (user.rol !== 'USER_ROL') {
            return res.status(401).json({
                ok:false,
                mensaje: 'tu rol no concuerda con el del usuario',
            });
        }
        res.status(200).json({
            ok: true,
            Nusuarios:usuarioAP.length,
            usuarios: usuarioAP
        });
    });


});

//===================================================================
// paginacion
//===================================================================
usuarioRoutes.get ('/:pagina/:Npaginas',verificatoken, (req:Request, res:Response)=> {
    const admin = req.body.usuario

    
    if (admin.rol !== 'ADMIN_ROL'){
        return res.status(401).json({
            ok:false,
            mensaje:'no eres administrador'
        });
    }
    
    
    var pagina = req.params.pagina || 0
    pagina = Number (pagina);

    var Npaginas = req.params.Npaginas || 2
    Npaginas = Number (Npaginas);

    Usuario.find({}, 'nombre apellido email password rol')
            .skip(pagina)
            .limit(Npaginas)
            .exec( (err: any,usuarios:any) => {
                if (err) {
                    return res.status(500).json({
                        ok:false,
                        mensaje: 'error en la base de datos',
                        err:err
                    });
                }

                Usuario.countDocuments({}, (err:any, conteo: any) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'erro en el conteo',
                            err:err
                        });
                    }

                    res.status(200).json({
                        ok:true,
                        total:conteo,
                        usuarios:usuarios
                    });
                });

            });

            

            
});
export default usuarioRoutes;