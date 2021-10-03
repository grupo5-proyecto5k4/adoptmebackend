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

 /*  Funcion de Adopcion   */
async function adopcionFuncion(req, res, user, next){
  const mascotas = await Adopcion.find({solicitanteId : user._id, mascotaId: objectId}) 
  var objectId = mongosee.Types.ObjectId(req.body.mascotaId);    
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
    tiempoSolo:req.body.tiempoSolo,
    accionImpedimento: req.body.accionImpedimento,
    tiempoPresupuesto: req.body.tiempoPresupuesto,
    Direccion:req.body.Direccion, 
    composicionFamilia:req.body.composicionFamilia,
    solicitanteId : user._id,
    mascotaId : animal._id,
    estadoId: estadoInicial,
    responsableId : animal.responsableId

    })

const result = await adopcion.save() 
  

// const result2 = await Animal.findByIdAndUpdate(objectId, { estado: "Adoptado",
//   fechaModificacion: new Date(Date.now()).toISOString()
// })

if (!result)  res.status(400).json ({error: "Oop! hubo un error con la adopcion"})
res.status(200).json({ _id : result._id}) 

}

 /*  Funcion de Provisorio   */
async function provisorioFuncion(req, res, user, next){
  var objectId = mongosee.Types.ObjectId(req.body.mascotaId); 
  const mascotas = await Provisorio.find({solicitanteId : user._id, mascotaId: objectId}) 
      
   if (mascotas.length != 0) return res.status(400).json({error: "Ya solicitaste el Provisorio de esta mascota"})

   const animal = await Animal.findById({_id: objectId})
  
   if (!animal) return res.status(400).json({error: "La mascota no existe"})
   if (animal.estado.indexOf('Provisorio') == - 1) return res.status(402).json({error: "La mascota no esta disponible para Provisorio"})
    
   let estadoInicial = 'Abierta'
  
   let provisorio = new Provisorio({
    animalTenencia:req.body.animalTenencia,
    tiempoTenencia: req.body.tiempoTenencia,
    otraMascota: req.body.otraMascota,
    cuantosMascotas:req.body.cuantosMascotas,
    gastosCubierto : req.body.gastosCubierto, 
    tiempoSuficiente:req.body.tiempoSuficiente,
    numeroContacto:req.body.numeroContacto, 
    correoElectronico:req.body.correoElectronico,
    solicitanteId : user._id,
    mascotaId : animal._id,
    estadoId: estadoInicial,
    responsableId: animal.responsableId

    })

const result = await provisorio.save() 
  

// const result2 = await Animal.findByIdAndUpdate(objectId, { estado: "Adoptado",
//   fechaModificacion: new Date(Date.now()).toISOString()
// })

if (!result)  res.status(400).json ({error: "Oop! hubo un error con el provisorio"})
res.status(200).json({ _id : result._id}) 

}

/*  post de adopcion y provisorio */

router.post('/adopcion', auth,  async function (req, res){
   let userAux = req.user.user
   //if(req.body.esAdopcion){
   
   if (req.body.vacunacionCastracion)
   {
    
      adopcionFuncion(req,res,userAux)
   }
   else
   {
     provisorioFuncion(req,res,userAux)
   }
})



router.get('/buscarAdopciones', async function (req, res) {
  let adopciones = await Adopcion.find()
  res.send(adopciones)
})


router.get('/adopcion/:id', async function (req , res) {
  let numero = 0 
  let solicitudAdopcion = await Adopcion.findById({_id : req.params.id})
  do {
    if (!solicitudAdopcion){
      solicitudAdopcion = await Provisorio.findById({_id : req.params.id})
      numero++
    }
    else { break;} 
    if(numero > 1 ) return res.status(400).json({error: "La Solicitud no exite"})
  }while(numero > 0 )
  let animal = await Animal.findById ({_id: solicitudAdopcion.mascotaId})
  if (!animal) return res.status(400).json({error: "La Mascota no exite"})
  res.send(solicitudAdopcion)
})

router.get('/buscar/solicitudadopcion/:tipoSolicitud', auth,  async function (req , res) {
  let userAux = req.user.user
  let solicitudAdopciones = await Adopcion.find({responsableId : mongosee.Types.ObjectId(userAux._id)})
  if (req.params.tipoSolicitud.indexOf('adopcion') == - 1){
    solicitudAdopciones = await Provisorio.find({responsableId : mongosee.Types.ObjectId(userAux._id)})
  }  
  let solicitudes = []
  
  for (let i = 0 ; i < solicitudAdopciones.length; i ++ ){
    let animal = await Animal.findById ({_id: solicitudAdopciones[i].mascotaId})
    if (!animal) continue
    let usuario = await User.findById({_id:mongosee.Types.ObjectId(solicitudAdopciones[i].solicitanteId)})
    if (!usuario) continue
     var diferencia= Math.abs(Date.now() - animal.fechaNacimiento)
     var edadDias = Math.round(diferencia/(1000*3600*24))
     var nuevoArreglo = {
               Solicitud: solicitudAdopciones[i],
               Animales: { nombreMascota :animal.nombreMascota,
                            edad:  edadDias },
               Solicitante:{ nombre: usuario.nombres,
                             apellido: usuario.apellidos,
                             email: usuario.correoElectronico,
                             telefono: usuario.numeroContacto,
                             facebook: usuario.facebook, 
                             instagram:usuario.instagram 
                             } 
                };
     solicitudes.push(nuevoArreglo)

  }

  
 
  res.send(solicitudes)
})


module.exports = router;
