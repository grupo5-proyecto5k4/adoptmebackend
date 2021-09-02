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
    console.log('llegamos...')
    try{
        if (!req.file) res.sendStatus(400).json({error: 'Error, no llegamos'})
        const result = await cloudinary.v2.uplouder.upload(req.file.path)
        newFoto = new Foto ({
            titulo: req.body.titulo,
            descripcion: req.body.descripcion,
            imagenURL: result.url, // la url que guardo cuando cloudinary me sube la imagen
            public_id: result.public_id, 
            id_Animal: req.body.id_Animal
        })
        let resultado = await newFoto.save()
        await fs.unlink(req.file.path)
        if (!resultado) res.sendStatus(400).json({error: 'Error, no llegamos'})
        res.sendStatus(400).json({mensaje: 'Se grabo correctamente'})
        next()
    }catch(e){
        res.status(400).send('Error, no llegamos')
    }
    
});


module.exports = router;