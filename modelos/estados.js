const jwt = require('jsonwebtoken')
const mongosee = require('mongoose')
const { ObjectId } = require('mongodb')

const estadoSchema  = new mongosee.Schema({
  id_estado: {type: Number},
  nombre: {type: String},
  fechaCreacion: {type: Date, default: Date.now},
  fechaModificacion:{type: Date, default: Date.now}
});
  
/* id_estado puede ser: 
1 - Activo (Usuario)
2 - Pendiente (Usuario)
3 - Bloqueado (Usuario)
7 - Disponible Adopción (Mascota)
8 - Disponible Adopción y provisorio (mascota)
9 - Disponible provisorio (mascota)
10 - Adoptado (mascota)
11 - En provisorio (mascota)*/

estadoSchema.methods.generateJWT = function(){
    return jwt.sign({
        _id: this._id,
        id_estado: this.id_estado,
        nombre: this.nombre,
        fechaCreacion: this.fechaCreacion,
        fechaModificacion: this.fechaModificacion
    }, process.env.SECRET_KEY_JWT)
}
const Estado = mongosee.model('am-estados', estadoSchema);
module.exports = Estado




