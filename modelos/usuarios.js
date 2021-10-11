const jwt = require('jsonwebtoken')
const mongosee = require('mongoose')
const { ObjectId } = require('mongodb')

const userSchema  = new mongosee.Schema({
  nombres: {
    type: String,
    required: true
   },
  apellidos: {type: String},
  dni:{type: Number},
  fechaNacimiento: {type: Date},
  Direccion: {
      calle: {type: String},
      numero: {type: Number}, 
      referencia: {type: String},
      barrio: {type: String},
      localidad:{type: String}
  },
  instagram: {type: String},
  facebook: {type: String}, 
  correoElectronico: {
    type: String,
    required: true,
    unique: true
  },
  contrasenia: {
    type: String,
    required: true 
   },
   tipoUsuario: {type: Number},
   numeroContacto: { type: Number },
   idEstado:{type: Number },
   fechaCreacion: {type: Date, default: Date.now},
   fechaModificacion:{type: Date, default: Date.now},
   banco: { type: String},
   cbu: {type: Number},
   alias : { type: String} 
   

});
  
/* tipoUsuario puede ser: 
0 - Admin
1 - Particular
2 - Rescatista */
 
userSchema.methods.generateJWT = function(){
  return jwt.sign({
      _id: this._id,
      nombres: this.nombres,
      apellidos: this.apellidos,
      dni: this.dni,
      Direccion:this.Direccion,
      fechaNacimiento: this.fechaNacimiento,
      facebook: this.facebook, 
      instagram: this.instagram,
      correoElectronico: this.correoElectronico,
      contrasenia: this.contrasenia,
      tipoUsuario: this.tipoUsuario,
      numeroContacto: this.numeroContacto,
      idEstado: this.idEstado,
      fechaCreacion: this.fechaCreacion,
      fechaModificacion:this.fechaModificacion
    }, process.env.SECRET_KEY_JWT)
}


const Usuario = mongosee.model('am-usuarios', userSchema);
module.exports = Usuario
