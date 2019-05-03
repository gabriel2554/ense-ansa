import {Router, Request, Response } from 'express';
import {Usuario} from '../modelos/usuario';
import bcrypt from 'bcrypt';
import jwd from 'jsonwebtoken';
import {SEED} from '../global/enviroment';

const loginRoutes = Router();

loginRoutes.post('/', (req:Request, res:Response) => {
    const body = req.body;

    Usuario.findOne({email: body.email}, (err, usuarioDB) => {
        if (err){
            return res.status(500).json({
                ok:false,
                mensaje:'error en la base de datos',
                err: err

           });
           
        }
        if(!usuarioDB){
            return res.status(404).json({
                ok: false,
                mensaje: 'el usuario no existe'
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'credenciales incorrectas',
            });
        }


        const token = jwd.sign({usuario: usuarioDB}, SEED, {expiresIn: 14000}  );


        res.status(200).json({
            ok:true,
            usuario: usuarioDB,
            token: token
        });
    });

});


export default loginRoutes;