const jwt = require('jsonwebtoken')
const mongosee = require('mongoose')
const { ObjectId } = require('mongodb')

const histoEstadoAnimalSchema  = new mongosee.Schema({
  mascotaId: mongosee.Types.ObjectId,   
  estadoId: {type: String},
  fechaCreacion: {type: Date, default: Date.now},

});

const histoEstadoAnimal = mongosee.model('am-histoEstadoAnimal', histoEstadoAnimalSchema);
module.exports = histoEstadoAnimal