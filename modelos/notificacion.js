class NotificationDto {
    id = 0;
    accountIdApplicant = {type: String};
    accountIdLender = {type: String};
    dateReaded = {type: Date};
    type = {type: String};
    requestId = {type: String};
    responseId = {type: String};
    senderId = {type: String};
    receiverId = {type: String};
    userId = null;
    createdAtNew = {type: Date, default: Date.now};
    accessed = false;
  }
  
  module.exports = NotificationDto;

  const jwt = require('jsonwebtoken')
const mongosee = require('mongoose'),

const notificacionSchema  = new mongosee.Schema({
  titulo: {type: String},
  descripcion: {type: String},
  imagenURL: {type: String},
  public_id: {type:String},
  id_Animal: ObjectId,



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
   fechaModificacion:{type: Date, default: Date.now}

});
  
/* tipoUsuario puede ser: 
0 - Admin
1 - Particular
2 - Rescatista */
 
notificacionSchema.methods.generateJWT = function(){
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


const Notificacion = mongosee.model('am-notificaciones', notificacionSchema);
module.exports = Notificacion;