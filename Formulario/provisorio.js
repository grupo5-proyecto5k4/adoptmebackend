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
   - cuantosMascotas: 
   - gastosCubierto: 0 - si 1 -no   
   - tiempoSuficiente: 

  DATOS CONTACTO  


   - descripcionOtraMascota : String  ( descripcion de la otra mascota texto - dato opcional)
   - tiempoPresupuesto: Si - 1 / No - 0
   - tiempoSolo: 0 - 1-3 hs / 1 - 4-8 hs / 2  - mas de 8 hs 
   - accionViaje: String ( que haría si viaja  y con quien se quedaría )
   - vacunacionCastracion: Vacunacion - 0 / VacunacionCastracion - 1 
   - accionImpedimento: 
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