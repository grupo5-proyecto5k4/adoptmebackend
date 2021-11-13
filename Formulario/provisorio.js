const bcrypt = require('bcrypt')
const mongosee = require('mongoose')
const express = require('express')
const Foto = require('../modelos/foto.js')
const jwt = require('jsonwebtoken')
const router = express.Router()
const {check, validationResult } = require('express-validator');
const { schema, eventNames } = require('../modelos/foto.js');
const cloudinary = require('cloudinary')
const fs = require('fs-extra')
const { ObjectId } = require('mongodb');
const ahora = require('../fecha.js')

/*
 datos de la Provisorio  
 MASCOTA:
   - animalTenencia : 0 - Perro   / 1 - Gatos / 2 - Ambos -->  
   - tiempoTenencia : -> numero indicando dias  
   - otraMascota : 0 - Ninguno   / 1 - Gato  / 2 - Perro / 3 - Ambos
   - cuantosMascotas:  numero de mascota 
   - gastosCubierto: true - si / false - no   
   - tiempoSuficiente: true - si / false - no 
   - seguimiento: Si - 1  / No - 0  / hasta los 6 meses - 2 

   VIVIENDA: 
   - vivienda:  casa: 0 /  depto: 1 
   - fotoVivienda :  (foto opcional)
   - permiso:  Si - 1 / No - 0   ¿Permita mascota?  
   - espacioAbierto: Balcon - 0 / Patio - 1 / Ambos - 2 / Ninguno - 3 ¿la vivienda tiene patio y/o balcon?  
   - descripcionCercamiento:   String (datos opcional)  
   - Direccion: idem a CentroRescatista 

  DATOS CONTACTO  
   - numeroContacto : 
   - correoElectronico : 
  */
 const FormularioProvisionSchema  = new mongosee.Schema({
 
 otraMascota :{
   type: Number,
   required: true
   },
 cuantosMascotas: { type: Number},   
 descripcionOtraMascota: {type: String},
        
 gastosCubiertos :{
   type: Number,
   required: true
   },    

 seguimiento: {
     type: Number,
     required: true
   },  
  cadaCuanto:{
    type: Number      
  },
  vivienda : {
     type: Number,
     required: true
   },

  permiso: {
     type: Number,
     required: true
   },
  tiempoTenencia :{
   type: Number,
   required: true
   },
  espacioAbierto: {
     type: Number,
     required: true
   },
  descripcionCercamiento: {type: String},
   
  tiempoSuficiente :{
    type: Number,
    required: true
   },
   
   Direccion:{
     calle: {type: String},
     numero: {type: Number}, 
     referencia: {type: String},
     barrio: {type: String},
     localidad:{type: String}
      
   },

 numeroContacto :{
     type: Number
   },  
 correoElectronico :{
   type: String,
       
   },
 estadoId: {
   type: String,
   required: true
   },
 responsableId: ObjectId,
 fechaCreacion:{
     type: Date, 
     default: ahora.ahora()
 },
    
 mascotaId : ObjectId,

 fechaModificacion:{
     type: Date, 
     default: ahora.ahora()
 }, 
    
 solicitanteId : ObjectId,
  //fecha fin para saber cuanto dura el provisorio

  fechaFinProvisorio:{
    type: Date    
  },
 
  observacionCancelacion: {
    type: String
  }, 

  cancelacionMotivoSolicitante: {
    type: String
  }

  });
    
  
  const FormularioProvision = mongosee.model('am-formulario-provision', FormularioProvisionSchema);
  
  module.exports = FormularioProvision