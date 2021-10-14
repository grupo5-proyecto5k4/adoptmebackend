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

/* Constantes*/

const estadoAprobado = "Aprobado"
const estadoAdoptado    = "Adoptado"
const estadoEnProvisorio= "En Provisorio"
const estadoDisProvisorio= "Disponible Provisorio"
const estadoDispAdopcion= "Disponible Adopcion" 
const estAdopcionProvisorio = "Disponible Adopción y Provisorio" 
const estadoInicial = 'Abierta'

 /*  Funcion de Adopcion   */
async function adopcionFuncion(req, res, user, next){
  var objectId = mongosee.Types.ObjectId(req.body.mascotaId);   
  const mascotas = await Adopcion.find({solicitanteId : user._id, mascotaId: objectId}) 
   
   if (mascotas.length != 0) return res.status(400).json({error: "Ya solicitaste la adopción de esta mascota"})

   const animal = await Animal.findById({_id: objectId})
  
   if (!animal) return res.status(400).json({error: "La mascota no existe"})
   if (animal.estado.indexOf('Adopción') == - 1) return res.status(402).json({error: "La mascota no esta disponible para la adopcion"})
    
  
  
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

async function modificarSolicitud(solicitud, tipo, usuario, estado){
  let esAprobado  = false
  let estadoNuevo = undefined
  let modelo      = Provisorio
  if (tipo) modelo = Adopcion
  
  if (solicitud.responsableId = usuario._id && estado) estadoNuevo = "Aprobado Por Responsable" 

  if (solicitud.responsableId = usuario._id && !estado) estadoNuevo = "Suspendido"
  
  
  if (solicitud.SolicitanteId = usuario._id && esAprobado && solicitud.estadoId == "Aprobado Por Responsable")
    { 
      estadoNuevo = "Aprobado"
        
    }
  if (solicitud.SolicitanteId = usuario._id && !esAprobado) estadoNuevo = "Suspendido Por Solicitante"
  
    
  let result2 = await modelo.findByIdAndUpdate(solicitud._id, 
     {estadoId: estadoNuevo,
        fechaModificacion : new Date(Date.now()).toISOString()},
     {new : true}
     
     )
  
    ani = modificarAnimal(solicitud, modelo, tipo, estadoNuevo)
   
   return (result2) 
  
}

async function modificarAnimal(solicitud, modelo, tipo, estadoNuevo){
  let esAprobado  = false
  let estadoNueAnimal = undefined
  

  let animal = await Animal.findById(solicitud.mascotaId)
  if (estadoNuevo != estadoAprobado ) return animal

  let estadoAntAnimal = animal.estado

  
  switch(animal.estado)
  {      case estadoDisProvisorio : 
            if(!tipo) estadoNueAnimal = estadoEnProvisorio;
            break;
         case estAdopcionProvisorio  : 
            if(!tipo) estadoNueAnimal = estadoDispAdopcion;
            break;
         default: 
            estado = undefined;
 
   }

   if (tipo) estadoNueAnimal = estadoAdoptado
   let  result = await Animal.findByIdAndUpdate(solicitud.mascotaId, 
    {estado: estadoNueAnimal,
    fechaModificacion : new Date(Date.now()).toISOString()
    }, 
    {new: true} )
   
   
    return (result)
  
}

router.put('/actualizarEstado/:estado/:idSolicitud', auth, async function(req, res, next){
  let userAux = req.user.user
  let banderaSolicitante = false 
  let esAprobado  = false
  let estadoNuevo = undefined
  let tipoAdopcion = false 
  if(userAux.tipoUsuario == 0) return res.status(400).json({error: 'No tiene autorizacion para hacer esta accion'})
  if(req.params.estado.indexOf('Aprobado') !=  0 && req.params.estado.indexOf('Rechazado') !=  0 ) return res.status(404).json({error: 'Estado inexistente'}) 
  
  if(req.params.estado.indexOf('Aprobado') ==  0) esAprobado  = true 

  let Solicitud = await Provisorio.findById({_id:req.params.idSolicitud})
  if (!Solicitud)tipoAdopcion = true 

  
  modificarSolicitud (Solicitud, tipoAdopcion , userAux, esAprobado ).then(val => res.send(val))

})


module.exports = router;
