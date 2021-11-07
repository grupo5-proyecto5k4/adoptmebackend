const jwt = require('jsonwebtoken')
const mongosee = require('mongoose')
const { ObjectId } = require('mongodb')
const ahora = require('../fecha.js')

const barrioSchema  = new mongosee.Schema({
  nombre: {type: String},
  fechaCreacion: {type: Date, default: ahora.ahora()},
  fechaModificacion:{type: Date, default: ahora.ahora()}
});
  

barrioSchema.methods.generateJWT = function(){
    return jwt.sign({
        _id: this._id,
        nombre: this.nombre,
        fechaCreacion: this.fechaCreacion,
        fechaModificacion: this.fechaModificacion
    }, process.env.SECRET_KEY_JWT)
}
const Barrio = mongosee.model('am-barrio', barrioSchema);
module.exports = Barrio




