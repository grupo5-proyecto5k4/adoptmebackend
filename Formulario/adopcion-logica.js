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
//const json_books = fs.readFileSync('src/book.json', 'utf-8')


router.post('/adopcion', auth,  async function (req, res){
   let userAux = req.user.user
   
   var objectId = mongosee.Types.ObjectId(req.body.mascotaId);
      
   const mascotas = await Adopcion.find({solicitanteId : userAux._id, mascotaId: objectId}) 
      
   if (mascotas.length != 0) return res.status(400).json({error: "Ya solicitaste la adopción de esta mascota"})

   const animal = await Animal.findById({_id: objectId})
  
   if (!animal) return res.status(400).json({error: "La mascota no existe"})
   if (animal.estado.indexOf('Adopción') == - 1) return res.status(402).json({error: "La mascota no esta disponible para la adopcion"})
    
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
    solicitanteId : userAux._id,
    mascotaId : animal._id,
    estadoId: estadoInicial

    })

const result = await adopcion.save() 
// const result2 = await Animal.findByIdAndUpdate(objectId, { estado: "Adoptado",
//   fechaModificacion: new Date(Date.now()).toISOString()
// })

if (!result)  res.status(400).json ({error: "Oop! hubo un error con la adopcion"})
res.status(200).json({ _id : result._id})  

})



router.get('/buscarAdopciones', async function (req, res) {
  let adopciones = await Adopcion.find()
  res.send(adopciones)
})


router.get('/adopcion/:id', async function (req , res) {
 
  let solicitudAdopcion = await Adopcion.findById({_id : req.params.id})
  if (!solicitudAdopcion) return res.status(400).json({error: "La Solicitud no exite"})
  let animal = await Animal.findById ({_id: solicitudAdopcion.mascotaId})
  if (!animal) return res.status(400).json({error: "La Mascota no exite"})
  res.send(solicitudAdopcion)
})

router.get('/buscar/solicitudadopcion', auth,  async function (req , res) {
  let userAux = req.user.user
  let solicitudAdopciones = await Adopcion.find({solicitanteId : mongosee.Types.ObjectId(userAux._id)})
  console.log(userAux._id)
  
  let solicitudes = []
 
  if (solicitudAdopciones == 0) return res.status(400).json({error: "No tenes solicitudes "})
  

  for (let i = 0 ; i < solicitudAdopciones.length; i ++ ){
    let animal = await Animal.findById ({_id: solicitudAdopciones[i].mascotaId})
     if (!animal) return res.status(400).json({error: "La Mascota no exite"})
     var diferencia= Math.abs(Date.now() - animal.fechaNacimiento)
     var edadDias = Math.round(diferencia/(1000*3600*24))
     var nuevoArreglo = {Solicitud: solicitudAdopciones[i],
                Animales: { nombreMascota :animal.nombreMascota,
                            edad:  edadDias },
               Solicitante:{ nombre: userAux.nombres,
                             apellido: userAux.apellidos,
                              email: userAux.correoElectronico,
                             telefono: userAux.numeroContacto,
                              facebook: userAux.facebook, 
                              instagram:userAux.instagram 
                             } 
                };
      solicitudes.push(nuevoArreglo)

  }
   
  
 
  res.send(solicitudes)
})


module.exports = router;
