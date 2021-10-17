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

//Reporte de estadísticas de cuanto tiempo pasa un animal desde que se le da de alta en la aplicación
// hasta que es finalmente adoptado

router.get('/animales/reporteTiempoAdopcion', auth, async function(req,res, next ){
    if(userAux.tipoUsuario != 2) return res.status(400).json({error: 'Esta función es solo para centros rescatistas'})
    let perrosFiltrados = []
    let gatosFiltrados = []
    for (let i = 0; i < Animal.length; i++) {
        if(Animal[i].estado == "Adoptado")
        {
            if(Animal[i].tipoAnimal == 0) //perro
            {
                var fechaAlta = Animal[i].fechaAlta
                var fechaModificacion = Animal[i].fechaModificacion
                var resta = fechaAlta.getTime() - fechaModificacion.getTime()
                perrosFiltrados.push(resta)
            }
            else{ //gato
                var fechaAlta = Animal[i].fechaAlta
                var fechaModificacion = Animal[i].fechaModificacion
                var resta = fechaAlta.getTime() - fechaModificacion.getTime()
                gatosFiltrados.push(resta)
            }
        }
    }
    let valorMaximoPerro = Math.max.apply(null, perrosFiltrados)
    let ValorMinimoPerro = Math.min.apply(null, perrosFiltrados)
    let valorMaximoGato = Math.max.apply(null, gatosFiltrados)
    let ValorMinimoGato = Math.min.apply(null, gatosFiltrados)
    res.send(valorMaximoPerro, ValorMinimoPerro, valorMaximoGato, ValorMinimoGato)
})