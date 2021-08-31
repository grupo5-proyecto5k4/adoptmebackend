const bcrypt = require('bcrypt')
const mongosee = require('mongoose')
const express = require('express')
const Foto = require('../modelos/foto.js')
const jwt = require('jsonwebtoken')
const router = express.Router()
const {check, validationResult } = require('express-validator');
const { schema, eventNames } = require('../modelos/foto.js');
const cloudinary = require('cloudinary');
const fs = require('fs-extra')


 cloudinary.config({
     cloud_name: process.env.cloudname,
     api_key: process.env.apikey,
     api_secret: process.env.apisecret
 })

router.get('/imagen', async (req,res) => {
    let foto =  await Foto.find();
    res.send(foto);
});


router.post('/imagen/add', async (req,res) => {
    console.log('llegamos...')
    console.log( 'que es este path', req.file.path)
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

    
});


module.exports = router;