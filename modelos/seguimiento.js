const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')
const mongosee = require('mongoose')

const seguimientoSchema  = new mongosee.Schema({
  SolicitudId: {
      type: ObjectId,
      required: true,   
    },
  estadoId: {
      type: String,
      required: true 
    },
  cadaCuanto: {type: Number},  //expresado en días
  fechaCreacion: {type: Date, default: Date.now},
  fechaModificacion:{type: Date, default: Date.now},
  Visita: [], 
  fecha: {type: Date, default: Date.now}  
});

const Seguimiento = mongosee.model('am-seguimiento', seguimientoSchema);
module.exports = Seguimiento
  