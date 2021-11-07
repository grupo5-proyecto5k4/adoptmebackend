const jwt = require('jsonwebtoken')
const mongosee = require('mongoose')
const { ObjectId } = require('mongodb')

const barrioSchema  = new mongosee.Schema({
  nombre: {type: String},
  fechaCreacion: {type: Date, default: Date.now},
  fechaModificacion:{type: Date, default: Date.now}
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




