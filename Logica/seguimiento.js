const bcrypt = require('bcrypt')
const mongosee = require('mongoose')
const express = require('express')
const Foto = require('../modelos/foto.js')
const jwt = require('jsonwebtoken')
const router = express.Router()
const { check, validationResult } = require('express-validator');
const { schema, eventNames, find } = require('../modelos/foto.js');
const Adopcion = require('../Formulario/adopcion.js')
const auth = require('../middleware/auth.js')
const Animal = require('../modelos/animal.js')
const Provisorio = require('../Formulario/provisorio.js')
const User = require('../modelos/usuarios.js')
const Seguimiento = require('../modelos/seguimiento.js')
const Visita = require('../modelos/visita.js')
const cloudinary = require('cloudinary')
const fs = require('fs-extra')
const ahora = require('../fecha.js')


cloudinary.config({
    cloud_name: process.env.cloudname,
    api_key: process.env.apikey,
    api_secret: process.env.apisecret
})


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
const estadoSuspSolicitante="Suspendido por Solicitante"
const estadoBloqueado = "Bloqueado"
const estadoAprobado = "Aprobado"
const estadoFinalizado = "Finalizado"

const estadoIniciadoSeg = "Iniciado" 
const estadoCerradoSeg = "Cerrado"


router.post('/crearSeguimiento', auth, async function (req, res){
  
    let seguimiento = await Seguimiento.find({SolicitudId:req.body._id})
    let estado = estadoIniciadoSeg
    if (seguimiento.length != 0) return res.status(401).json({ error: "el seguimiento ya existe" })
    seguimiento = new Seguimiento({
        SolicitudId: req.body._id,
        estadoId: estado,
        cadaCuanto: req.body.cadaCuanto,
    })
    const result = await seguimiento.save()
    if (!result) return res.status(401).json({ error: "No se grabo correctamente" })

    res.send(result)
})

router.post('/crearVisita/:id_Seguimiento', auth, async function (req, res) {
    

   // crear un registro nuevo de visitas 
   let visitasNew = new Visita({
    SeguimientoId: req.params.id_Seguimiento,
    descripcionVisita: req.body.descripcionVisita
    
   })

  let NV = await visitasNew.save()   

  let seg = await Seguimiento.findById(NV.SeguimientoId) 
  let v = seg.Visita
  v.push(NV)

  await Seguimiento.findByIdAndUpdate(NV.SeguimientoId, 
    {
     Visita : v,   
     fechaModificacion:ahora.ahora()
    }, 
    {new: true}

 )

   
  res.status(200).json({ id_Animal: NV._id })
    
})


router.put('/modificarSeguimiento/visita', auth, async function (req, res) {
    let userAux = req.user.user
    
    var visita = []
    let modVisita
    let aniCod = req.body.id_Animal 
    let numero = 0
    if (req.files.length != undefined) numero = req.files.length

    var f = req.files    
    for(let i=0; i < req.files.length; i ++ ){
        result2 = await cloudinary.v2.uploader.upload(f[i].path)
        let reg = { imagenURL : result2.url}
        visita.push(reg)
    }
    modVisita = await Visita.findByIdAndUpdate(aniCod, 
        {
           visitaFotos : visita,   
        
        }, 
        {new: true}
       )

    // buscamos la visita
    modVisita = await Visita.findById({_id: aniCod})   
 
   // modificamos el seguimiento
   actualizarSeg(modVisita)
   
    res.send(modVisita)
})

async function actualizarSeg(visita){
    let seg = await Seguimiento.findById(visita.SeguimientoId) 
    let v = seg.Visita
    for(i=0; i < v.length; i ++){
       if(v[i]._id == visita._id){
          for(j=0; j < visita.visitaFotos.length; j ++) { v[i].visitaFotos.push(visita.visitaFotos[j])}
        }
    }
    console.log("funcion visita", visita)
    await Seguimiento.findByIdAndUpdate(visita.SeguimientoId, 
        {
         Visita : v,   
         fechaModificacion:ahora.ahora()
        }, 
        {new: true}
    
     )

}

//finalizar proceso de Seguimiento 

router.put('/finalizar/seguimiento/:idSolicitud', auth, async function(req, res, next){
    let userAux = req.user.user
    if(userAux.tipoUsuario == 0) return res.status(404).json({error:"No tiene permiso para esta acción"})
    let result = await Seguimiento.findOne({SolicitudId : req.params.idSolicitud})

    if(!result) return res.status(404).json({error: "No encontramos los datos de la mascota"})

    let result1 = await Seguimiento.findByIdAndUpdate(result._id, {
        estadoId : estadoCerradoSeg,
        fechaModificacion : ahora.ahora()
    },
    {
        new: true 
    })

    res.send(result1)
})   
  
   //consultar proceso de Seguimiento  
 router.get('/consultaEstado/:id_Animal', auth, async function(req, res){
    let userAux = req.user.user
    var seguimiento = []
    if(userAux.tipoUsuario == 0) return res.status(404).json({error:"No tiene permiso para esta acción"})   
    
    let solAdo = await Adopcion.find({mascotaId: req.params.id_Animal, estadoId: estadoAprobado}) 
    if (solAdo.length != undefined){
       for(let i = 0; i < solAdo.length; i ++){
         var seg = await Seguimiento.findOne({SolicitudId : solAdo[i]._id, estadoId: estadoIniciadoSeg})
         if(seg != undefined ||seg != null  ) seguimiento.push(seg)


       }
    
    }
    if (solAdo) {
        var seg = await Seguimiento.findOne({SolicitudId : solAdo._id, estadoIniciadoSeg})
         if(seg != undefined ||seg != null  ) seguimiento.push(seg)
    }   
    let solPro = await Provisorio.find({mascotaId: req.params.id_Animal})
    if (solPro.length != undefined){
        for(let i = 0; i < solPro.length; i ++){
            var seg = await Seguimiento.findOne({SolicitudId : solPro[i]._id, estadoId : estadoIniciadoSeg})
            if(seg != undefined ||seg != null  ) seguimiento.push(seg)
        }
     
     }
     if (solPro) {
        var seg = await Seguimiento.findOne({SolicitudId : solPro._id, estadoIniciadoSeg})
        if(seg != undefined ||seg != null  ) seguimiento.push(seg)
     }
     
    res.send(seguimiento)
})




module.exports = router;