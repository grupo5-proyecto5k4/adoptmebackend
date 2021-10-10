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

/*
 datos de la Provisorio  
 MASCOTA:
   - animalTenencia : 0 - Perro   / 1 - Gatos / 2 - Ambos 
   - tiempoTenencia : -> numero indicando dias  
   - otraMascota : 0 - Ninguno   / 1 - Gato  / 2 - Perro / 3 - Ambos
   - cuantosMascotas:  numero de mascora 
   - gastosCubierto: true - si / false - no   
   - tiempoSuficiente: true - si / false - no 

  DATOS CONTACTO  
   - numeroContacto : 
   - correoElectronico : 
  */
 const FormularioProvisionSchema  = new mongosee.Schema({
  animalTenencia :{
    type: Number,
    required: true
    },
  tiempoTenencia :{
    type: Number,
    required: true
    },
  otraMascota :{
    type: Number,
    required: true
    }, 
  cuantosMascotas :{
      type: Number,
      required: true
      },     
  gastosCubierto :{
    type: Number,
    required: true
    },    

  tiempoSuficiente :{
    type: Number,
    required: true
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
      default: Date.now
  },
    
  mascotaId : ObjectId,

  fechaModificacion:{
      type: Date, 
      default: Date.now
  }, 
    
  solicitanteId : ObjectId
  

  });
    
  
  const FormularioProvision = mongosee.model('am-formulario-provision', FormularioProvisionSchema);
  
  module.exports = FormularioProvision