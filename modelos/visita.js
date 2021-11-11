const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')
const mongosee = require('mongoose')
const ahora = require('../fecha.js')

const visitaSchema  = new mongosee.Schema({
  SeguimientoId: {
      type: ObjectId,
      required: true,   
    },
  descripcionVisita : {
    type: String,
    required: true

  },
  visitaFotos: [], 

  fechaCreacion: {type: Date, default: ahora.ahora()},
   

});

const Visita = mongosee.model('am-visita', visitaSchema);
module.exports = Visita
  