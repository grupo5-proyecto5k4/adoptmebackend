const jwt = require('jsonwebtoken')
const mongosee = require('mongoose')

const vacunaSchema  = new mongosee.Schema({
  nombre: {type: String},
  cantidadDosis: {type: number},
  fechaCreacion: {type: Date, default: Date.now},
  fechaModificacion:{type: Date, default: Date.now}
});
  
vacunaSchema.methods.generateJWT = function(){
    return jwt.sign({
        nombre: this.nombre,
        cantidadDosis: this.cantidadDosis,
        fechaCreacion: this.fechaCreacion,
        fechaModificacion: this.fechaModificacion
    }, process.env.SECRET_KEY_JWT)
}
const Vacuna = mongosee.model('am-vacuna', vacunaSchema);
module.exports = Vacuna




