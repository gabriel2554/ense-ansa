import express from 'express';
import {SERVER_PORT}  from '../global/enviroment';

export default class server{

    public app: express.Application;
    public port: number;



//inicializa algo
constructor() {

    this.app = express ();
    this.port = SERVER_PORT;


}

start (callback: Function) {
    this.app.listen(this.port, callback);

}
}