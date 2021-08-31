const bcrypt = require('bcrypt')
const mongosee = require('mongoose')
const express = require('express')
const Animal = require('../modelos/animal.js')
const jwt = require('jsonwebtoken')
const router = express.Router()
const {check, validationResult } = require('express-validator');
const { schema } = require('../modelos/animal.js')

const Foto = require('../modelos/foto.js')
const cloudinary = require('cloudinary');
const fs = require('fs-extra')


 cloudinary.config({
     cloud_name: process.env.cloudname,
     api_key: process.env.apikey,
     api_secret: process.env.apisecret
 })


//Buscar un animal por un determinado id
router.get('/idAnimal', async (req, res) => {
    let animal =  await Animal.find();
    res.send(animal)
})

//Cargar un animal

router.post('/animal', async function(req, res) {
    let castrado = true 
    if (req.body.castrado == 2) castrado = false 
    let animal = new Animal({
        tipoMascota: req.body.tipoMascota,
        nombreMascota : req.body.nombreMascota,
        fechaAlta: req.body.fechaAlta,
        fechaModificacion: req.body.fechaModificacion,
        tamañoFinal: req.body.tamañoFinal,
        esCachorro: req.body.esCachorro,
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
 
    console.log('llegamos...')
    console.log( 'que es este path', req.file.path)
    if (req.file.path == undefined) res.sendStatus(400).json({error: 'Error, no llegamos'})
    const resulta = await cloudinary.v2.uplouder.upload(req.file.path)
    newFoto = new Foto ({
       titulo: req.body.titulo,
       descripcion: req.body.descripcion,
       imagenURL: resulta.url, // la url que guardo cuando cloudinary me sube la imagen
       public_id: resulta.public_id, 
       id_Animal: req.body.id_Animal
   })
   let resultado = await newFoto.save()
   await fs.unlink(req.file.path)
   if (!resultado) res.sendStatus(400).json({error: 'Error, no llegamos'})
   res.sendStatus(200).json({mensaje: 'Se grabo correctamente'})

res.status(201).header('animal_creado', jwtToken).send()
});


// filtrar mascotas segun su estado
router.get('/animal/:estados', async(req, res)=>{

    //let estados = await Estado.findOne({nombre : req.params.estado}) 

    //if (!animal) return res.status(404).json({error: 'El estado es inválido'})
    
    let animal = await Animal.find({estado : req.params.estados}) 

    if (animal.length == 0) return res.status(404).json({error: 'No hemos encontrado ningún animal que coincida con ese estado'})
    
    res.send(animal)
});

module.exports = router;