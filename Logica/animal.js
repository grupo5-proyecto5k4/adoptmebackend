const bcrypt = require('bcrypt')
const mongosee = require('mongoose')
const express = require('express')
const Animal = require('../modelos/animal.js')
const jwt = require('jsonwebtoken')
const router = express.Router()
const {check, validationResult } = require('express-validator');
const { schema } = require('../modelos/animal.js')
const auth = require('../middleware/auth.js')

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
// agregar el token 
// funciono para foto 



router.post('/animal', auth,  async function(req, res) {
    let userAux = req.user.user
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
        responsableId: userAux._id,
        castrado: this.castrado,
        conductaNiños: req.body.conductaNiños,
        conductaPerros: req.body.conductaPerros,
        conductaGatos: req.body.conductaGatos,
        descripcion: req.body.descripcion,
        foto: req.body.foto
 })
   
const result = await animal.save()
const jwtToken = result.generateJWT()
 
console.log (result)

res.status(201).json({id_Animal: result._id})
});


// filtrar mascotas segun su estado
router.get('/animal/:estados', async(req, res)=>{

    let animal = await Animal.find({estado : req.params.estados}) 

    if (animal.length == 0) return res.status(404).json({error: 'No hemos encontrado ningún animal que coincida con ese estado'})
    
    res.send(animal)
});

module.exports = router;