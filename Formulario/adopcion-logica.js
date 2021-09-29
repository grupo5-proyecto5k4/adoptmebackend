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


router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods','POST, GET, OPTIONS, DELETE, PUT');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,  auth-token");
  next();
});




router.options('/adopcion', auth, async function(req, res)  {
  res.status(200).send('Ok - Options')
 
})


router.post('/adopcion', auth,  async function (req, res){
   let userAux = req.user.user
   
   var objectId = mongosee.Types.ObjectId(req.body.mascotaID);
      
   const mascotas = await Adopcion.find({responsableID : userAux._id, mascotaID: objectId}) 
      
   if (mascotas.length != 0) return res.status(402).json({error: "Oop!, Ya realizaste esta adopcion"})

   const animal = await Animal.findById({_id: objectId})
  
   if (!animal) return res.status(402).json({error: "Oop!, La mascota no existe"})
   if (animal.estado.indexOf('Adopción') == - 1) return res.status(402).json({error: "Oop!, La mascota no esta disponible para la adopcion"})
    
   let estadoInicial = 'Abierta'
  
   let adopcion = new Adopcion({
    otraMascota: req.body.otraMascota,
    descripcionOtraMascota:req.body.descripcionOtraMascota,
    tiempoSolo: req.body.tiempoSolo,
    accionViaje:req.body.accionViaje,
    accionImpedimento : req.body.accionImpedimento, 
    vacunacionCastracion:req.body.vacunacionCastracion,
    seguimiento:req.body.seguimiento, 
    vivienda:req.body.vivienda,
    fotoVivienda:req.body.FotoVivienda,
    espacioAbierto: req.body.espacioAbierto,
    descripcionCercamiento: req.body.descripcionCercamiento,
    permiso: req.body.permiso, 
    tiempoPresupuesto: req.body.tiempoPresupuesto,
    Direccion:req.body.Direccion, 
    composicionFamilia:req.body.composicionFamilia,
    solitanteId : userAux._id,
    mascotaId : animal._id,
    estadoId: estadoInicial

    })

const result = await adopcion.save() 
const result2 = await Animal.findByIdAndUpdate(objectId, { estado: "Adoptado",
  fechaModificacion: new Date(Date.now()).toISOString()
})

if (!result)  res.status(404).json ({error: "Oop! hubo un error con la adopcion"})
res.status(201).json({id_Solicitud : result._id})  

})

router.get('/buscarAdopciones', async function (req, res) {
  let adopciones = await Adopcion.find()
  res.send(adopciones)
})

module.exports = router;
