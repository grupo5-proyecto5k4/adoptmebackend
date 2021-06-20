const jwt = require('jsonwebtoken')
const mongosee = require('mongoose')

const userSchema  = new mongosee.Schema({
  nombres: {
    type: String,
    required: true
   },
  apellidos: {
    type: String},
  dni:{
    type: Number,
    unique: true
  },
  fechaNacimiento: {type: Date, default: Date.now },
  direccion: {
      calle: {type: String},
      numero: {type: Number}, 
      referencia: {type: String},
      barrio: {type: String},
      localidad:{type: String}
  },
  instagram: {type: String},
  facebook: {type: String}, 
  correoElectronico: {type: String},
  contrasenia: {
    type: String,
    required: true 
   },
   tipoUsusario: {
     type: Number,
     required: true
    }

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
      direccion: this.direccion,
      fechaNacimiento: this.fechaNacimiento,
      facebook: this.facebook, 
      instagram: this.instagram,
      correoElectronico: this.correoElectronico,
      contrasenia: this.contrasenia,
      tipoUsuario: this.tipoUsuario
  }, process.env.SECRET_KEY_JWT_CAR_API)
}

const Usuario = mongosee.model('am-usuarios', userSchema);

module.exports = Usuario