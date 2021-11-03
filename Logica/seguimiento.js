const bcrypt = require('bcrypt')
const mongosee = require('mongoose')
const express = require('express')
const Foto = require('../modelos/foto.js')
const jwt = require('jsonwebtoken')
const router = express.Router()
const { check, validationResult } = require('express-validator');
const { schema, eventNames } = require('../modelos/foto.js');
const Adopcion = require('../Formulario/adopcion.js')
const auth = require('../middleware/auth.js')
const Animal = require('../modelos/animal.js')
const Provisorio = require('../Formulario/provisorio.js')
const User = require('../modelos/usuarios.js')
const Seguimiento = require('../modelos/seguimiento.js')
const cloudinary = require('cloudinary')
const fs = require('fs-extra')


cloudinary.config({
    cloud_name: process.env.cloudname,
    api_key: process.env.apikey,
    api_secret: process.env.apisecret
})



router.post('/crearSeguimiento', auth, async function (req, res){
  
    let seguimiento = await Seguimiento.find({SolicitudId:req.body_id})
    let estado = "Iniciado"
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

router.put('/modificarSeguimiento', auth, async function (req, res) {
    let userAux = req.user.user
    let seg = await Seguimiento.findById({_id: req.body.seguimientoId})
    var visita = seg.Visita
    var foto = [] 
    if (!req.files) res.status(400).json({error: 'Error, no llegamos'})
    
    let result2
    let numero = 0 
    
   for(let i = 0; i < req.files.length ; i ++ ){
        result2 = await cloudinary.v2.uploader.upload(req.files[i].path)
        let reg = { imagenURL : result2.url}
        foto.push(reg)
   } 
   let f = {descripcion : req.body.descripcion, 
            imagines:foto,
            fecha : new Date(Date.now()).toISOString()         

}
    
 visita.push(f)
    if (seg){
        await Seguimiento.findByIdAndUpdate(seg._Id, 
            {Visita: visita,
             fechaModificacion:new Date(Date.now()).toISOString()
            }, 
            {new: true}

        )
    }


})


//finalizar proceso de Seguimiento 

router.put('/finalizar/seguimiento/:idSolicitud', auth, async function(req, res, next){
    let userAux = req.user.user
    if(userAux.tipoUsuario != 0) return res.status(404).json({error:"No tiene permiso para esta acción"})
    let result = await Seguimiento.find({id_Solicitud : req.params.idSolicitud})

    if(!result) return res.status(404).json({error: "No encontramos los datos de la mascota"})

    result = await Seguimiento.findByIdAndUpdate(result._id, {
        estadoId : "Cerrada",
        fechaModificacion : new Date(Date.now()).toISOString()

    },
    {
        new: true 
    })
     
    

})


module.exports = router;