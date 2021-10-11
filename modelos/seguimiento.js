const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')
const mongosee = require('mongoose')

const seguimientoSchema  = new mongosee.Schema({
  idSolicitud: {
      type: ObjectId,
      required: true     
    },
  estadoId: {
      type: String,
      required: true 
    },
  cadaCuanto: {type: String},  
  fechaCreacion: {type: Date, default: Date.now},
  fechaModificacion:{type: Date, default: Date.now},
  fecha: {type: Date, default: Date.now}  
});

const Seguimiento = mongosee.model('am-seguimiento', seguimientoSchema);
module.exports = Seguimiento
  