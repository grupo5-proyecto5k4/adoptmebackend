const jwt = require('jsonwebtoken')
const mongosee = require('mongoose')

const userSchema  = new mongosee.Schema({
  nombres: {
    type: String,
    required: true
   },
  apellidos: {
    type: String,
    required: true
  },
  dni:{
    type: Number,
    required: true,
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
  esParticular: {type: Boolean}, 
  esRescatista: {type: Boolean}

});
  
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
      esParticular: this.esParticular,
      esRescatista: this.esRescatista
  }, process.env.SECRET_KEY_JWT_CAR_API)
}

const Usuario = mongosee.model('am_usuarios', userSchema);

module.exports = Usuario