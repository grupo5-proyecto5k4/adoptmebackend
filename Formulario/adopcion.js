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
 datos de la adopcion 
 MASCOTA:
   - otraMascota : Si - 1  / No - 0  
   - descripcionOtraMascota : String  ( descripcion de la otra mascota texto - dato opcional)
   - tiempoPresupuesto: Si - 1 / No - 0
   - accionViaje: String ( que haría si viaja  y con quien se quedaría )
   - vacunacionCastracion: Vacunacion - 0 / VacunacionCastracion - 1 
   - seguimiento: Si - 1  / No - 0  / hasta los 6 meses - 2 


 VIVIENDA: 
   - vivienda:  casa: 0 /  depto: 1 
   - fotoVivienda :  (foto opcional)
   - permiso:  Si - 1 / No - 0   ¿Permita mascota?  
   - espacioAbierto: Balcon - 0 / Patio - 1 / Ambos - 2 / Ninguno - 3 ¿la vivienda tiene patio y/o balcon?  
   - descripcionCercamiento:   String (datos opcional)  
   - Direccion: idem a CentroRescatista

 
 FAMILIA:
   - composicionFamilia: String     

   responsableID : id de la persona que inicia la adopcion
   mascotaID  : mascota que fue adoptada
   fecha de creacion     : 
   fecha de modificacion : 
   estado: 
   
*/

const FormularioAdopcionSchema  = new mongosee.Schema({
    otraMascota :{
      type: Number,
      required: true
      },
    descripcionOtraMascota: {type: String},
    tiempoPresupuesto:{
      type: Number,
      required: true
    },
    accionViaje:{
      type: String,
      required: true
    },
    vacunacionCastracion : {
      type: Number,
      required: true
    },
    seguimiento: {
      type: Number,
      required: true
    },
    vivienda : {
      type: Number,
      required: true
    },
    fotoVivienda: {type: String},
    permiso: {
      type: Number,
      required: true
    },
    espacioAbierto: {
      type: Number,
      required: true
    },
    descripcionCercamiento: {type: String},
    Direccion:{
      calle: {type: String},
      numero: {type: Number}, 
      referencia: {type: String},
      barrio: {type: String},
      localidad:{type: String}
      
    },
    composicionFamilia:{
      type: String,
      required: true
    },

    responsableID: ObjectId,
    
    mascotaID : ObjectId,

    fechaCreacion:{
      type: Date, 
      default: Date.now
    },

    fechaModificacion:{
      type: Date, 
      default: Date.now
    },

    estado: {
      type: String,
      required: true
    }

  });
    
  
  const FormularioAdopcion = mongosee.model('am-formulario-adopcion', FormularioAdopcionSchema);
  
  module.exports = FormularioAdopcion


