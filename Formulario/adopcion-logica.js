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
const histoEstadoAnimal= require('../modelos/histoEstadoAnimal.js')
const ahora = require('../fecha.js')
const Seguimiento = require('../modelos/seguimiento.js')

/* estados Animal*/
const estadoAdoptado    = "Adoptado"
const estadoEnProvisorio= "En provisorio"
const estadoDisProvisorio= "Disponible Provisorio"
const estadoDispAdopcion= "Disponible Adopción" 
const estAdopcionProvisorio = "Disponible Adopción y Provisorio" 
/*Estados de Solicitud */
const estadoInicial = 'Abierta'
const estadoAproResponsable = "Aprobado Por Responsable" 
const estadoSuspendido = "Suspendido"
const estadoBloqueado = "Bloqueado"
const estadoAprobado = "Aprobado"
const estadoFinalizado = "Finalizado"

const estadoIniciadoSeg = "Iniciado" 
const estadoCerradoSeg = "Cerrado"
const estadoSuspSolicitante="Suspendido por Solicitante"


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
  



if (!result)  res.status(400).json ({error: "Oop! hubo un error con la adopcion"})
res.status(200).json({ _id : result._id}) 

}

 /*  Funcion de Provisorio   */
async function provisorioFuncion(req, res, user, next){
  var objectId = mongosee.Types.ObjectId(req.body.mascotaId); 
  const mascotas = await Provisorio.find({solicitanteId : user._id, mascotaId: objectId, estadoId: estadoInicial}) 
      
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
  



if (!result)  res.status(400).json ({error: "Oop! hubo un error con el provisorio"})
res.status(200).json({ _id : result._id}) 

}

/* Funcion para traer solicitudes*/ 
async function realizarSolicitud(solicitudAdopciones,res,  next){
  let solicitudes = []  
  
  let desde = solicitudAdopciones.length
  
  if (solicitudAdopciones.length == undefined && solicitudAdopciones.estadoId != (estadoBloqueado || estadoSuspendido || estadoSuspSolicitante))
   {
    desde = 0 
    let animal = await Animal.findById ({_id: solicitudAdopciones.mascotaId})
    if (!animal) return solicitudes
    let usuario = await User.findById({_id:mongosee.Types.ObjectId(solicitudAdopciones.solicitanteId)})
    if (!usuario) return solicitudes
     var diferencia= Math.abs(ahora.ahora() - animal.fechaNacimiento)
     var edadDias = Math.round(diferencia/(1000*3600*24))
     var nuevoArreglo = {
               Solicitud: solicitudAdopciones,
               Animales: { nombreMascota :animal.nombreMascota,
                           edad:  edadDias,
                           responsableId: animal.responsableId
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
    if(solicitudAdopciones[i].estadoId == (estadoBloqueado || estadoSuspendido || estadoSuspSolicitante)) continue  
    let animal = await Animal.findById ({_id: solicitudAdopciones[i].mascotaId})
    if (!animal) continue
    let usuario = await User.findById({_id:mongosee.Types.ObjectId(solicitudAdopciones[i].solicitanteId)})
    if (!usuario) continue
     var diferencia= Math.abs(ahora.ahora() - animal.fechaNacimiento)
     var edadDias = Math.round(diferencia/(1000*3600*24))
     var nuevoArreglo = {
               Solicitud: solicitudAdopciones[i],
               Animales: { nombreMascota :animal.nombreMascota,
                            edad:  edadDias, 
                            responsableId: animal.responsableId
                          },
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
   let esAdoptado = false
   if(req.body.vacunacionCastracion != undefined) esAdoptado = true
      
   if (esAdoptado)
   {
     adopcionFuncion(req, res, userAux)
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
  
  if (req.params.tipoSolicitud.indexOf('Provisorio') == 0){
    solicitudAdopciones = await Provisorio.find({solicitanteId : mongosee.Types.ObjectId(userAux._id)})
  }  
    
  realizarSolicitud(solicitudAdopciones).then(val => res.send(val))
})

async function modificarSolicitud(modelo, usuario, esAprobado, solicitud, esAdoptado, observacion, fechaFinProvisorio, cadaCuanto){
  
  var result2 
  let estadoNuevo = undefined

  
  if (solicitud.responsableId == usuario._id && esAprobado) estadoNuevo = estadoAproResponsable

  if (solicitud.responsableId == usuario._id && !esAprobado) estadoNuevo = estadoSuspendido
    
  if (solicitud.solicitanteId == usuario._id && esAprobado && solicitud.estadoId == estadoAproResponsable) estadoNuevo = estadoAprobado
              
  if (solicitud.solicitanteId == usuario._id && !esAprobado) estadoNuevo = estadoSuspSolicitante
  
  

  if(estadoNuevo) {
      if ( modelo == Adopcion){
      result2 = await Adopcion.findByIdAndUpdate(solicitud._id, 
      {estadoId: estadoNuevo,
       observacionCancelacion : observacion,
       cadaCuanto: cadaCuanto,  
       fechaModificacion : ahora.ahora()},
      {new : true}
      
      )
     }
      if(modelo == Provisorio){
        if (fechaFinProvisorio != (undefined || null)){
          result2 = await modelo.findByIdAndUpdate(solicitud._id, 
            {estadoId: estadoNuevo,
             fechaFinProvisorio: fechaFinProvisorio,
             cadaCuanto: cadaCuanto, 
             observacionCancelacion : observacion, 
             fechaModificacion : ahora.ahora()},
            {new : true})

        }
      else{
          result2 = await modelo.findByIdAndUpdate(solicitud._id, 
              {estadoId: estadoNuevo,
               observacionCancelacion : observacion,
               cadaCuanto: cadaCuanto,  
               fechaModificacion : ahora.ahora()},
              {new : true})
        }
        
         
      }
    
    modificarAnimal(solicitud, esAdoptado, estadoNuevo)
     
     
  // si es aprobado por el responsables las demas solicitudes deben estar bloqueadas 
    if (result2.estadoId == estadoAproResponsable) 
     { let solicitudes = await modelo.find({responsableId :solicitud.responsableId , mascotaId: solicitud.mascotaId, estadoId: estadoInicial })
       modificarSolicitudBloqueada(solicitudes, modelo, estadoBloqueado, solicitud)
    }
  
 // Si el aprobado por el solicitante las demas Solicitudes debe quedar Suspendidas   
    if (result2.estadoId == estadoAprobado ) 
     {        
       let solicitudes = await modelo.find({responsableId :solicitud.responsableId , mascotaId: solicitud.mascotaId, estado: estadoInicial })
       modificarSolicitudBloqueada(solicitudes, modelo, estadoSuspendido, solicitud)
       agregarSeguimiento(solicitud._id, cadaCuanto)
      }

    }

   return (result2) 
  
  
}

// agregar seguimiento
async function agregarSeguimiento(solicitud_Id, paramCadaCuanto){
  let estado = estadoIniciadoSeg

  let seguimiento = new Seguimiento({
        SolicitudId: solicitud_Id,
        estadoId: estado,
        cadaCuanto: paramCadaCuanto,
    })
    let result = await seguimiento.save()
   
  }


/* Modificacion del Estado del  Animales*/
async function modificarAnimal(solicitud, esAdoptado, estadoNuevo){
  
  let estadoNueAnimal = undefined
  var fin = false

  let animal = await Animal.findById({_id : solicitud.mascotaId})
  if (estadoNuevo == estadoAproResponsable) actualizarAnimal(animal, animal.estado, false)
  if (estadoNuevo == estadoSuspSolicitante) actualizarAnimal(animal, animal.estado, true)
  if (estadoNuevo == estadoAprobado) fin = true
  

  let estadoAntAnimal = animal.estado
  let esVisible = false
  
  switch(animal.estado)
  {      case estadoDisProvisorio : 
            if(!esAdoptado) estadoNueAnimal = estadoEnProvisorio;
            break;
         case estAdopcionProvisorio  : 
            if(!esAdoptado) estadoNueAnimal = estadoEnProvisorio;
            break;
         default: 
            estadoNueAnimal = undefined;
 
   }

   if (esAdoptado) estadoNueAnimal = estadoAdoptado
   
   if (estadoNueAnimal && fin ) 
    {  
     actualizarAnimal(animal,estadoNueAnimal,esVisible)
    }
  
  
}

async function actualizarAnimal(animal, estadoNueAnimal, esVisible){
  let estadoAntAnimal = animal.estado
  if (estadoNueAnimal == estadoAntAnimal){
      await Animal.findByIdAndUpdate(animal._id, 
        { 
          visible : esVisible,
          fechaModificacion : ahora.ahora()
        }, 
        { new: true
        } 
        )
  }
   if (estadoNueAnimal != estadoAntAnimal ){
    await Animal.findByIdAndUpdate(animal._id, 
      { estado: estadoNueAnimal,
        visible : esVisible,
        fechaModificacion : ahora.ahora()
      }, 
      { new: true
      } 
      )   

      let historial = new histoEstadoAnimal({
        mascotaId : animal._id,
        estadoId :  estadoAntAnimal})
        await historial.save()
        
    }
  
}

/* Modificacion del Estado de Las Solicitudes */
async function modificarSolicitudBloqueada(solicitud, modelo, estadoNuevo, SolicitudAceptada){
  let desde = solicitud.length
  for (let i = 0; i < desde; i++){
    if (solicitud[i]._id == SolicitudAceptada._id) continue
    await modelo.findByIdAndUpdate(solicitud[i]._id, 
      {estadoId: estadoNuevo,
       fechaModificacion : ahora.ahora()},
      {new : true}
    )
  }
  
}

router.put('/actualizarEstado/:estado/:idSolicitud', auth, async function(req, res, next){
  let userAux = req.user.user
  let esAprobado  = false
  let esAdoptado  = false
  let modelo = Provisorio
 
  
  if(userAux.tipoUsuario == 0) return res.status(400).json({error: 'No tiene autorizacion para hacer esta accion'})
  if(req.params.estado.indexOf('Aprobado') !=  0 && req.params.estado.indexOf('Rechazado') !=  0 ) return res.status(404).json({error: 'Estado inexistente'}) 
  
  if(req.params.estado.indexOf('Aprobado') ==  0) esAprobado  = true 

  let Solicitud = await Provisorio.findById({_id:req.params.idSolicitud})
  if (!Solicitud) {
    Solicitud = await Adopcion.findById({_id:req.params.idSolicitud}), 
    esAdoptado = true
    modelo = Adopcion
  }
  var fechaFinProvisorio =  req.body.fechaFinProvisorio
 
  var observacion = ""
  if(req.body.observacion != undefined) observacion = req.body.observacion
  
  var cadaCuanto = req.body.cadaCuanto
  
  var motivo = ""
  if(req.body.motivo != undefined) observacion = req.body.motivo

  modificarSolicitud(modelo, userAux, esAprobado, Solicitud , esAdoptado, observacion, fechaFinProvisorio, cadaCuanto).then(val => res.send(val))

})


// historial de Mascota
router.get('/historialProvisorio/:idMascota', auth, async function(req, res, next){
  let userAux = req.user.user
   
  if(userAux.tipoUsuario == 0) return res.status(400).json({error: 'No tiene autorizacion para hacer esta accion'})
  
  let historial = await Provisorio.find({mascotaId:mongosee.Types.ObjectId (req.params.idMascota)}).sort({fechaModificacion: -1})
  
  res.send(historial)
})

// fin de Provisorio Manual  por mal seguimiento 
router.put('/finProvisorio/:idSolicitud', auth, async function(req, res, next){
  let userAux = req.user.user
   
  if(userAux.tipoUsuario == 0) return res.status(400).json({error: 'No tiene autorizacion para hacer esta accion'})
  
  let provi = await Provisorio.findByIdAndUpdate(mongosee.Types.ObjectId(req.params.idSolicitud),
  {
    observacionCancelacion : req.body.observacion,
    fechaModificacion : ahora.ahora(),
    estadoId : estadoFinalizado

  },
  {
    new: true
  }
    
  )
  

  res.send(historial)
})




module.exports = router;
