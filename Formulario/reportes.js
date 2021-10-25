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

/* estados Animal*/
const estadoAprobado = "Aprobado"
const estadoAdoptado    = "Adoptado"
const estadoEnProvisorio= "En Provisorio"
const estadoDisProvisorio= "Disponible Provisorio"
const estadoDispAdopcion= "Disponible Adopción" 
const estAdopcionProvisorio = "Disponible Adopción y Provisorio" 
/*Estados de Solicitud */
const estadoInicial = 'Abierta'
const estadoAproResponsable = "Aprobado Por Responsable" 
const estadoSuspendido = "Suspendido"
const estadoSuspSolicitante="Suspendido por Solicitante"
const estadoBloqueado = "Bloqueado"


router.get('/animales/provisorio', auth,  async function(req,res, next ){
    let userAux = req.user.user
  
    if(userAux.tipoUsuario != 2) return res.status(400).json({error: 'No tiene autorizacion para realizar esta acción'})
  //  var num = parseInt(req.params.ultimoMes, 10)
   
  //  var mil = ((num)*24*60*60 *1000)  
  //  var f = new Date(Date.now() + mil).toISOString()
    
    // ver formato de fecha 
    var desde = (req.query.fechaDesde)
    var hasta = req.query.fechaHasta
    
    // contador de total de adoptados que son provisorio
    var contTotalAdopPerro = 0
    var contTotalAdopGato = 0 
    let contTotalAdopPro
    // Contado de total que fueron adoptados por la Solicitante que le dio Provisorio
    var contTotalAdopProPerro = 0 
    var contTotalAdopProGato = 0
    //falta agregar el responsable:id 
  
    let Adoptados = await Adopcion.find({estado: estadoAprobado, responsableId: userAux._id ,  fechaCreacion: {$gte: desde, $lte: hasta}})
    for(let i ; i < Adoptados.length ; i ++)
    { 
        let esPerro = false
        let ani = await Animal.findOne({_id: Adoptados[i].mascotaId})  
        if (ani.tipoMascota == 0) esPerro = true

        let provisorios = await Provisorio.find({
            mascotaId: Adoptados[i].mascotaId,
            responsableId: Adoptados[i].responsableId,
            solicitanteId: Adoptados[i].solicitanteId,
            estadoId: estadoAprobado
          })
        if(provisorios.length > 0 && esPerro) {
            contTotalAdopProPerro ++
            contTotalAdopPerro ++
            contTotalAdopPro ++ 
            continue
        }
        if(provisorios.length > 0) {
            contTotalAdopProGato ++
            contTotalAdopGato ++
            contTotalAdopPro ++
            continue
        }    
       provisorios = await Provisorio.find({
            mascotaId: Adoptados[i].mascotaId,
            responsableId: Adoptados[i].responsableId,
            solicitanteId: {$ne : Adoptados[i].solicitanteId},
            estadoId: estadoAprobado
          })
       
       if(provisorios.length > 0 && esPerro) {
           contTotalAdopPerro ++ 
           contTotalAdopPro ++ 
           continue 
       }
       if(provisorios.length > 0) {
           contTotalAdopGato ++
           contTotalAdopPro ++
       } 
    }
    

    let arreglo = {
        "AdopcionconProvisorioGato" : contTotalAdopGato,
        "AdopcionconProvisorioPerro" : contTotalAdopPerro,
        "TotalAdopcionProvisorio" : contTotalAdopPro
    
    } 

    res.send(arreglo)
})




module.exports = router;