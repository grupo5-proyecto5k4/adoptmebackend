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
    let castrado = true 
    if (req.body.castrado == 2) castrado = false 
    let cachorro = true 
    if (req.body.castrado == 2) cachorro = false 
    let animal = new Animal({
        tipoMascota: req.body.tipoMascota,
        nombreMascota : req.body.nombreMascota,
        fechaAlta: req.body.fechaAlta,
        fechaModificacion: req.body.fechaModificacion,
        tamañoFinal: req.body.tamañoFinal,
        esCachorro: this.cachorro,
        edad: req.body.edad,
        sexo: req.body.sexo,
        razaPadre: req.body.razaPadre,
        razaMadre: req.body.razaMadre,
        estado: req.body.estado,
        responsableCategoria: req.body.responsableCategoria,
        responsableId: req.body.responsableId,
        castrado: this.castrado,
        conductaNiños: req.body.conductaNiños,
        conductaPerros: req.body.conductaPerros,
        conductaGatos: req.body.conductaGatos,
        descripcion: req.body.descripcion

    })
   
     const result = await animal.save()
     const jwtToken = result.generateJWT()
 
       
    if (!req.file) res.status(400).json({error: 'Error, no llegamos'})
    const result2 = await cloudinary.v2.uploader.upload(req.file.path)
    
    newFoto = new Foto ({
        titulo: req.body.titulo,
        descripcion: req.body.descripcion,
        imagenURL: result2.url, // la url que guardo cuando cloudinary me sube la imagen
        public_id: result2.public_id, 
        id_Animal: result._id
    })
    let resultado = await newFoto.save()
    await fs.unlink(req.file.path)
    if (!resultado) res.status(400).json({error: 'Error, no llegamos'})
    res.status(200).json({mensaje: 'Se grabo correctamente'})
       
    
});


module.exports = router;