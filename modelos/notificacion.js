const jwt = require('jsonwebtoken')
const mongosee = require('mongoose')
const ahora = require('../fecha.js')

const notificacionSchema = new mongosee.Schema({
/*
/
    tipoNotificacion?:string; //usuarioNormal //usuarioAdmin 
    nombreNotificacion: string;
    descripcion: string;
    remitenteId?: string;
    leida?: number;
    fechaCreacion?: Date;
    objetoAMostrar?: string; //indica el nombre de la coleccion en la que tengo que buscar después
    objetoAMostrarId?: string;

*/
    
    tipoNotificacion: { type: String, default: "usuarioNormal" },
    nombreNotificacion: {
        type: String,
        required: true,
    },
    descripcion: {
        type: String,
        required: true,
    },
    remitenteId: { type: String },
    fechaCreacion: { type: Date, default: ahora.ahora() },
    leida: { type: Number, default: 0 }, //0 - no leida, 1 - leida
    objetoAMostrar: { type: String }, //indica el nombre de la coleccion en la que tengo que buscar después
    objetoAMostrarId: { type: String }, //indica el id del objeto a mostrar de la coleccion indicada arriba
    
});
/* Tipo recomendacion: 0- veterinaria, 1- centro rescatista
    abierto24hs: 0- No, 1- Si
  */
    notificacionSchema.methods.generateJWT = function () {
    return jwt.sign({
        _id: this._id,
        tipoNotificacion: this.tipoNotificacion,
        nombreNotificacion: this.nombreNotificacion,
        descripcion: this.descripcion,
        remitenteId: this.remitenteId,
        fechaCreacion: this.fechaCreacion,
        leida: this.leida,
        objetoAMostrar: this.objetoAMostrar,
        objetoAMostrarId: this.objetoAMostrarId,

    }, process.env.SECRET_KEY_JWT)
}
const Notificacion = mongosee.model('am-notificacion', notificacionSchema);
module.exports = Notificacion