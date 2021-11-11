const bcrypt = require('bcrypt')
const mongosee = require('mongoose')
const express = require('express')
const Foto = require('../modelos/foto.js')
const jwt = require('jsonwebtoken')
const router = express.Router()
const {check, validationResult } = require('express-validator')
const { schema, eventNames } = require('../modelos/foto.js')
var cloudinary = require('cloudinary')
const fs = require('fs-extra')
const Animal = require('../modelos/animal.js')
const ahora = require('../fecha.js')
//
router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods','POST, GET, OPTIONS, DELETE, PUT');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,  auth-token");
    next();
  });

 cloudinary.config({
     cloud_name: process.env.cloudname,
     api_key: process.env.apikey,
     api_secret: process.env.apisecret
 })

router.get('/imagen', async (req,res) => {
    let foto =  await Foto.find();
    res.send(foto);
});

router.options('/imagen/add', async function(req, res)  {
    res.status(200).send('Ok - Options')
   
})

router.post('/imagen/add', async (req,res) => {
   
    let aniCod = req.body.id_Animal     
    
    if (!req.files) res.status(400).json({error: 'Error, no llegamos'})
    
    let result2
    let numero = 0 
    
   req.files.forEach( async (element) => {
        result2 = await cloudinary.v2.uploader.upload(element.path)
        newFoto = new Foto ({
            imagenURL: result2.url, // la url que guardo cuando cloudinary me sube la imagen
            public_id: result2.public_id, 
            id_Animal: aniCod
        })
        
        let resultado = await newFoto.save()
        await fs.unlink(element.path)

        if (!resultado) res.status(400).json({error: 'Error, no llegamos'})
       
     
        
        let a = await Animal.findById({_id: aniCod})
        const F = a.Foto
        
        F.push({ foto: result2.url, esPrincipal : esPrincipal}) 
  
        
        let animal = await Animal.findByIdAndUpdate({_id :aniCod},
        { Foto: F,
            fechaModificacion: ahora.ahora()      
        },
        {new: true 
        })
       
        if (!animal) res.status(400).json({error: 'Error, la mascota no esite'})
          
   })    
   
    
    res.status(200).json({mensaje: 'Se grabo correctamente'})
    
    
});


module.exports = router;