const bcrypt = require('bcrypt')
const mongosee = require('mongoose')
const express = require('express')
const Notificacion = require('../modelos/notificacion.js')
const jwt = require('jsonwebtoken')
const router = express.Router()
const {check, validationResult } = require('express-validator');
const { schema } = require('../modelos/notificacion.js')
const auth = require('../middleware/auth.js')


router.post('/notificacion', auth,  async function(req, res) { 
    let notificacion = new Notificacion({
        tipoNotificacion: req.body.tipoNotificacion,
        nombreNotificacion: req.body.nombreNotificacion,
        descripcion: req.body.descripcion,
        remitenteId: req.body.remitenteId,
        fechaCreacion: req.body.fechaCreacion,
        leida: req.body.leida,
        objetoAMostrar: req.body.objetoAMostrar,
        objetoAMostrarId: req.body.objetoAMostrarId
 })
   
const result = await notificacion.save()
const jwtToken = result.generateJWT()
 
console.log (result)

res.status(201).json() //json({id_Animal: result._id}) ver si se necesita que pase algo de la recomendacion
});

router.get('/notificaciones', auth, async(req, res)=>{
    let userAux = req.user.user 
    
    if (userAux.tipoUsuario == 0){
        notificaciones = await Notificacion.find({tipoNotificacion : "usuarioAdmin"})
    }
    else{
        notificaciones = await Notificacion.find({tipoNotificacion : "usuarioNormal", remitenteId : userAux._id})
    }
    if (notificaciones.length == 0) return res.status(404).json({error: 'No ha recibido notificaciones'})


    res.send(notificaciones)
    
});

router.get('/cantNotificaciones', auth, async(req, res)=>{
   
    notificacionesSinLeer = await Notificacion.find({leida : 0})

    res.send(notificacionesSinLeer.length)
    
});


module.exports = router;