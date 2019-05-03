import Server from './clases/server';
import {SERVER_PORT} from  './global/enviroment';
import mongoose from 'mongoose';
import bodyParser  from'body-parser';
import cors from 'cors';

//importar rutas
import usuarioRoutes from './rutas/usuario';
import loginRoutes from './rutas/login';
const server = new Server() ;

//BodyParser
server.app.use(bodyParser.urlencoded({extended: true})  );
server.app.use( bodyParser.json());

//CORS
server.app.use( cors ({ origin: true, credentials: true}) );

// seteo de rutas
 server.app.use( '/usuario', usuarioRoutes);
server.app.use('/login', loginRoutes);

//conexion a mongoose
mongoose.connect ('mongodb://localhost/Nematronix', {useCreateIndex: true, useNewUrlParser: true}, (err) => {
    if (err) throw err;
    console.log ('conectado a la base de datos');
});

server.start(() => {

    console.log(`servidor corriendo en ${SERVER_PORT}`)
});


