const jwt = require('jsonwebtoken')
const mongosee = require('mongoose')

const userSchema  = new mongosee.Schema({
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

userSchema.methods.generateJWT = function(){
    return jwt.sign({
        id_estado: this.id_estado,
        nombre: this.nombre,
        fechaCreacion: this.fechaCreacion,
        fechaModificacion: this.fechaModificacion
    }, process.env.SECRET_KEY_JWT)
}
const Estado = mongosee.model('am-estados', userSchema);
module.exports = Estado




