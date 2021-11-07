const jwt = require('jsonwebtoken')
const mongosee = require('mongoose')
const { ObjectId } = require('mongodb')
const ahora = require('../fecha.js')

const histoEstadoAnimalSchema  = new mongosee.Schema({
  mascotaId: mongosee.Types.ObjectId,   
  estadoId: {type: String},
  fechaCreacion: {type: Date, default: ahora.ahora()},

});

const histoEstadoAnimal = mongosee.model('am-histo-estado-animal', histoEstadoAnimalSchema);
module.exports = histoEstadoAnimal