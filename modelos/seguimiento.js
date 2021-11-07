const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')
const mongosee = require('mongoose')
const ahora = require('../fecha.js')

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
  fechaCreacion: {type: Date, default: ahora.ahora()},
  fechaModificacion:{type: Date, default: ahora.ahora()},
  Visita: [], 
  fecha: {type: Date, default: ahora.ahora()}  
});

const Seguimiento = mongosee.model('am-seguimiento', seguimientoSchema);
module.exports = Seguimiento
  