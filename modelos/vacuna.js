const jwt = require('jsonwebtoken')
const mongosee = require('mongoose')
const { ObjectId } = require('mongodb');

const vacunaSchema  = new mongosee.Schema({
  nombreVacuna: {type: String},
  fechaAplicacion: {type: Date},
  fechaCreacion: {type: Date, default: Date.now},
  fechaModificacion:{type: Date, default: Date.now},
  id_Animal:  ObjectId
});
  
vacunaSchema.methods.generateJWT = function(){
    return jwt.sign({
        nombreVacuna: this.nombre,
        fechaAplicacion: this.fechaAplicacion,
        fechaCreacion: this.fechaCreacion,
        fechaModificacion: this.fechaModificacion
    }, process.env.SECRET_KEY_JWT)
}
const Vacuna = mongosee.model('am-vacuna', vacunaSchema);
module.exports = Vacuna




