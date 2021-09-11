const bcrypt = require('bcrypt')
const mongosee = require('mongoose')
const express = require('express')
const Recomendacion = require('../modelos/recomendacion.js')
const jwt = require('jsonwebtoken')
const router = express.Router()
const {check, validationResult } = require('express-validator');
const { schema } = require('../modelos/recomendacion.js')
const auth = require('../middleware/auth.js')


router.post('/recomendacion', auth,  async function(req, res) { 
    let recomendacion = new Recomendacion({
        tipoRecomendacion: req.body.tipoRecomendacion,
        nombre: req.body.nombre,
        calle: req.body.calle,
        numero: req.body.numero,
        sitioWeb: req.body.sitioWeb,
        abierto24hs: req.body.abierto24hs,
        latitud: req.body.latitud,
        longitud: req.body.longitud
 })
   
const result = await recomendacion.save()
const jwtToken = result.generateJWT()
 
console.log (result)

res.status(201).json() //json({id_Animal: result._id}) ver si se necesita que pase algo de la recomendacion
});


// enviar recomendaciones en general
router.get('/recomendaciones', async(req, res)=>{

    let recomendaciones = await Recomendacion.find() 

    if (recomendaciones.length == 0) return res.status(404).json({error: 'No hemos encontrado ninguna recomendacion registrada'})
    
    res.send(recomendaciones)
});

// enviar recomendaciones para el mapa
router.get('/recomendacionesMapa', async(req, res)=>{

    let recomendaciones = await Recomendacion.find({estado : 1}) 

    if (recomendaciones.length == 0) return res.status(404).json({error: 'No hemos encontrado ninguna recomendacion registrada o activa'})
    
    res.send(recomendaciones)
});



/*
router.put('/recomendaciones/:id_recomendacion', auth, async(req, res)=> {
    let userAux = req.user.user 
     
    if (userAux.tipoUsuario != 0) return res.status(404).json({error: 'No tiene permisos para este accion'})
   
    //new Date(Date.now()).toISOString()
     let user = await User.findByIdAndUpdate(req.params.id_centro,
        { idEstado: req.body.idEstado,
          fechaModificacion: new Date(Date.now()).toISOString()

        }, {
            new: true
        })
       
        
     if(!user) return res.status(404).json({error: 'No se ha encontrado el Centro Rescatista indicado'})
 
   
     
    if (user.idEstado == 1) return  res.status(200).json({mensaje: 'El Centro Rescatista ha sido habilitado'})
    if (user.idEstado != 1) return  res.status(200).json({mensaje: 'El Centro Rescatista ha sido rechazado'})
      
    


});
*/

module.exports = router;