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

router.options('/notificacion/:id_notificacion', async function(req, res)  {
    res.status(200).send('Ok - Options')
   
})

res.sendStatus(201).json() //json({id_Animal: result._id}) ver si se necesita que pase algo de la recomendacion
});

router.get('/notificaciones', auth, async(req, res)=>{
    let userAux = req.user.user 
    
    if (userAux.tipoUsuario == 0){
        notificaciones = await Notificacion.find({tipoNotificacion : "usuarioAdmin"}).sort({fechaCreacion: -1})
    }
    else{
        notificaciones = await Notificacion.find({tipoNotificacion : "usuarioNormal", remitenteId : userAux._id}).sort({fechaCreacion: -1})
    }

    res.send(notificaciones)
    
});

router.put('/notificacion/:id_notificacion', auth, async(req, res)=> {
    //new Date(Date.now()).toISOString()
     let notificacion = await Notificacion.findByIdAndUpdate(req.params.id_notificacion,
        
        { leida: req.body.leida,
          fechaModificacion: new Date(Date.now()).toISOString()
        }, {
            new: true
        })
       
     if(!notificacion) return res.status(404).json({error: 'No se ha encontrado la notificacion indicada'})  
     else res.status(200).send();
});


module.exports = router;