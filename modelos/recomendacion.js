const jwt = require('jsonwebtoken')
const mongosee = require('mongoose')

const recomendacionSchema = new mongosee.Schema({
    tipoRecomendacion: {
        type: Number,
        required: true
    },
    nombre: {
        type: String,
        required: true,
    },
    fechaAlta: { type: Date, default: Date.now },
    fechaModificacion: { type: Date, default: Date.now },
    calle: {
        type: String,
        required: true
    },
    numero: {
        type: Number,
        required: true
    },
    estado: { type: String, default: 1 },
    sitioWeb: { type: String },
    abierto24hs: {
        type: Number,
        required: true
    },
    latitud: {
        type: Number,
        required: true
    },
    longitud: {
        type: Number,
        required: true
    },
    
});
/* Tipo recomendacion: 0- veterinaria, 1- centro rescatista
    abierto24hs: 0- No, 1- Si
  */
recomendacionSchema.methods.generateJWT = function () {
    return jwt.sign({
        _id: this._id,
        tipoRecomendacion: this.tipoRecomendacion,
        nombre: this.nombre,
        fechaAlta: this.fechaAlta,
        fechaModificacion: this.fechaModificacion,
        calle: this.calle,
        numero: this.numero,
        estado: this.estado,
        sitioWeb: this.sitioWeb,
        abierto24hs: this.abierto24hs,
        latitud: this.latitud,
        longitud: this.longitud,
    }, process.env.SECRET_KEY_JWT)
}
const Recomendacion = mongosee.model('am-recomendacion', recomendacionSchema);
module.exports = Recomendacion