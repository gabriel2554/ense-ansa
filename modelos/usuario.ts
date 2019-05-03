import {Document, Schema, Model, model} from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import {IUsuario} from '../interfaces/usuario';


export interface IUsuarioModel extends IUsuario, Document{
    fullName: string;
}

const rolesValidos ={
    values: ['ADMIN_ROL', 'USER_ROL'],
    message: '{value} no es un rol valido'
}
export var usuarioSchema: Schema = new Schema ({
    nombre: {type: String, required:[true, 'nombre necesario']},
    apellido: {type: String, required:[true, 'apellido necesario']},
    email: { type: String, unique: true, required:[true, 'correo necesario'] },
    password: {type: String, required:[true, 'contraseña necesaria'] },
    rol:{type:String, enum:rolesValidos, default:'USER_ROL'}
}, {collection: 'usuarios'});

usuarioSchema.plugin(uniqueValidator, {message: '{PATH} DEBE SER UNICO!'});

export const Usuario: Model<IUsuarioModel> = model<IUsuarioModel> ("Usuario", usuarioSchema);