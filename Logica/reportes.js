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
const Adopcion = require('../Formulario/adopcion.js')
const auth = require('../middleware/auth.js')
const Animal = require('../modelos/animal.js')
const Provisorio = require('../Formulario/provisorio.js')
const User = require('../modelos/usuarios.js')


router.get('/animales/provisorio', auth, async function(req,res, next ){
    let userAux = req.user.user
  
    if(userAux.tipoUsuario != 2) return res.status(400).json({error: 'No tiene autorizacion para realizar esta acción'})
     
    let animalesAdoptado = await Animal.find({responsableId: userAux._id, estado: "Adoptado"})
})

