const bcrypt = require('bcrypt')
const mongosee = require('mongoose')
const express = require('express')
const Notificacion = require('../modelos/notificacion.js')
const jwt = require('jsonwebtoken')
const router = express.Router()
const {check, validationResult } = require('express-validator');
const { schema } = require('../modelos/notificacion.js')
const auth = require('../middleware/auth.js')
const ahora = require('../fecha.js')

router.post('/notificacion', auth,  async function(req, res) { 
    let notificacion = new Notificacion({
        tipoNotificacion: req.body.tipoNotificacion,
        nombreNotificacion: req.body.nombreNotificacion,
        descripcion: req.body.descripcion,
        remitenteId: req.body.remitenteId,
        fechaCreacion: ahora.ahora(),
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

res.status(200).json({mensaje: 'notificacion creada correctamente'}) //json({id_Animal: result._id}) ver si se necesita que pase algo de la recomendacion
});

router.get('/notificaciones', auth, async(req, res)=>{
    let userAux = req.user.user 
    let notificaciones = {}
    if (userAux.tipoUsuario == 0 && userAux.tipoUsuario){ notificaciones = await Notificacion.find({tipoNotificacion : "usuarioAdmin"}).sort({fechaCreacion: -1})}
    if (userAux.tipoUsuario != 0 && userAux.tipoUsuario){ notificaciones = await Notificacion.find({tipoNotificacion : "usuarioNormal", remitenteId : userAux._id}).sort({fechaCreacion: -1})}

    res.send(notificaciones)
    
});

router.put('/notificacion/:id_notificacion', auth, async(req, res)=> {
    let notificacion = await Notificacion.findByIdAndUpdate(req.params.id_notificacion,
        
        { leida: req.body.leida,
          fechaModificacion: ahora.ahora()
        }, {
            new: true
        })
       
     if(!notificacion) return res.status(404).json({error: 'No se ha encontrado la notificacion indicada'})  
     else res.status(200).send();
});

module.exports = router;