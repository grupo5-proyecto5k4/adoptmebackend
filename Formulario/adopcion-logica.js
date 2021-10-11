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
  var objectId = mongosee.Types.ObjectId(req.body.mascotaId);   
  const mascotas = await Adopcion.find({solicitanteId : user._id, mascotaId: objectId}) 
   
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
    otraMascota: req.body.otraMascota, 
    descripcionOtraMascota: req.body.descripcionOtraMascota,
    gastosCubiertos : req.body.gastosCubiertos,
    seguimiento:req.body.seguimiento, 
    vivienda:req.body.vivienda,
    permiso: req.body.permiso,
    tiempoTenencia: req.body.tiempoTenencia,
    espacioAbierto: req.body.espacioAbierto,
    descripcionCercamiento: req.body.descripcionCercamiento,
    tiempoSuficiente:req.body.tiempoSuficiente,
    Direccion:req.body.Direccion, 
    numeroContacto:user.numeroContacto, 
    correoElectronico:user.correoElectronico,
    mascotaId : animal._id,
    cuantosMascotas:req.body.cuantosMascotas,
    solicitanteId : user._id,
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

/* Funcion para traer solicitudes*/ 
async function realizarSolicitud(solicitudAdopciones,res,  next){
  let solicitudes = []  
  
  let desde = solicitudAdopciones.length
  
  if (solicitudAdopciones.length == undefined) {
    desde = 0 
    let animal = await Animal.findById ({_id: solicitudAdopciones.mascotaId})
    if (!animal) return solicitudes
    let usuario = await User.findById({_id:mongosee.Types.ObjectId(solicitudAdopciones.solicitanteId)})
    if (!usuario) return solicitudes
     var diferencia= Math.abs(Date.now() - animal.fechaNacimiento)
     var edadDias = Math.round(diferencia/(1000*3600*24))
     var nuevoArreglo = {
               Solicitud: solicitudAdopciones,
               Animales: { nombreMascota :animal.nombreMascota,
                           edad:  edadDias
                          },
               Solicitante:{ nombre: usuario.nombres,
                             apellido: usuario.apellidos,
                             email: usuario.correoElectronico,
                             telefono: usuario.numeroContacto,
                             facebook: usuario.facebook, 
                             instagram:usuario.instagram 
                             } 
                };
     
     return nuevoArreglo

  }
  
  for (let i = 0 ; i < desde ; i ++ ){
    
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
return (solicitudes)
}


router.post('/adopcion', auth,  async function (req, res){
   let userAux = req.user.user
   //if(req.body.esAdopcion){
   
   if (req.body.vacunacionCastracion)
   {
    
      adopcionFuncion(req,res,userAux)
   }
   else
   {
     provisorioFuncion( req, res ,userAux)
   }
})



router.get('/buscarAdopciones', async function (req, res) {
  let adopciones = await Adopcion.find(_id = req.body)
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
    if(numero > 1 ) return res.send(solicitudAdopcion)
  }while(numero > 0 )
 
  
  realizarSolicitud(solicitudAdopcion).then(val => res.send(val))
  
})

router.get('/buscar/solicitudadopcion/:tipoSolicitud', auth,  async function (req , res) {
  let userAux = req.user.user
  let solicitudAdopciones = await Adopcion.find({responsableId : mongosee.Types.ObjectId(userAux._id)})
 
  if (req.params.tipoSolicitud.indexOf('provisorio') ==  0){
    solicitudAdopciones = await Provisorio.find({responsableId : mongosee.Types.ObjectId(userAux._id)})
    
  }  
 
   realizarSolicitud(solicitudAdopciones).then(val => res.send(val))


})

router.get('/buscar/solicitudrealizada/:tipoSolicitud', auth,  async function (req , res) {
  
  let userAux = req.user.user
 
  let solicitudAdopciones = await Adopcion.find({solicitanteId : mongosee.Types.ObjectId(userAux._id)})
  
  if (req.params.tipoSolicitud.indexOf('provisorio') == 0){
    solicitudAdopciones = await Provisorio.find({solicitanteId : mongosee.Types.ObjectId(userAux._id)})
  }  
    
  realizarSolicitud(solicitudAdopciones).then(val => res.send(val))
})

router.put('/actualizarEstado/:estado/:idSolicitud', auth, async function(req, res, next){
  let userAux = req.user.user
  
  if(userAux.tipoUsuario != 0) return res.status(400).json({error: 'No tiene autorizacion para hacer esta accion'})
  if(req.params.estado.indexOf('Aprobado') !=  0 && req.params.estado.indexOf('Rechazado') !=  0 ) return res.status(404).json({error: 'Estado inexistente'}) 
 
  let Solicitud = await Provisorio.findById({_id:req.params.idSolicitud})
  let result2 = await Provisorio.findByIdAndUpdate(Solicitud._id, 
    {estadoId: req.params.estado,
     fechaModificacion : new Date(Date.now()).toISOString()},
     {new : true})

  if(req.params.estado.indexOf('Aprobado') ==  0){
    let result = await Animal.findByIdAndUpdate(Solicitud.mascotaId, 
      {estado: 'En Provisorio',
      fechaModificacion : new Date(Date.now()).toISOString()
      }, 
      {new: true} )
  }
    
 if (!result2) res.status(400).json({error:' no se actualizo correctamente'})

 res.send('actualizacion correctamente')
 

})


module.exports = router;
