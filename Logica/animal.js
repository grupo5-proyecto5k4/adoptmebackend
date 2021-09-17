const bcrypt = require('bcrypt')
const mongosee = require('mongoose')
const express = require('express')
const Animal = require('../modelos/animal.js')
const jwt = require('jsonwebtoken')
const router = express.Router()
const {check, validationResult } = require('express-validator');
const auth = require('../middleware/auth.js')
const { ObjectId } = require('mongodb');
const Foto = require('../modelos/foto.js')
const cloudinary = require('cloudinary');
const fs = require('fs-extra');
const Estados = require('../modelos/estados.js')
const { schema } = require('../modelos/estados.js')
const Vacuna = require('../modelos/vacuna.js')


 cloudinary.config({
     cloud_name: process.env.cloudname,
     api_key: process.env.apikey,
     api_secret: process.env.apisecret
 })


//Buscar un animal por un determinado id
router.get('/buscar', async function(req, res) {
    console.log('llega')

    const animal =  await Animal.find()
    console.log(animal)
    res.send(animal)
})

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
        foto: req.body.foto,
        nombreVacuna: req.body.nombreVacuna,
        cantidadDosis: req.body.cantidadDosis
 })
   
const result = await animal.save()
const jwtToken = result.generateJWT()
 
console.log (result)

res.status(201).json({id_Animal: result._id})
});

// filtrar mascotas segun su estado
router.get('/animal/:estados', async(req, res)=>{
    let nueva = req.params.estados.replace(/_/g, " ")
    console.log(nueva)

    let animal = await Animal.find({estado : nueva}) 

    if (animal.length == 0) return res.status(404).json({error: 'No hemos encontrado ningún animal que coincida con ese estado'})
    
    res.send(animal)
});

// filtrar mascotas segun su estado y segun el id del responsable
router.get('/respestados/:responestados', auth, async(req, res)=>{
    let nueva = req.params.responestados.replace(/_/g, " ")
    let userAux = req.user.user
    let animal = await Animal.find({responsableId : userAux._id, estado : nueva }) 
    
    if (animal.length == 0) return res.status(404).json({error: 'No hemos encontrado ningún animal que coincida con ese estado'})
    res.send(animal)
});

//filtrar por id_animal la vacuna y la cantidad de dosis
router.get('/animalvacuna/:idMascotaVacuna', async(req, res)=>{
    let nueva = req.params.idMascotaVacuna.replace(/_/g, " ")
    let animal = req.Animal._id
    let vacuna = req.Vacuna.Vacuna
    let dosis = req.Vacuna.Vacuna
    let animal = await Animal.find({animal : _id, vacuna : nombreVacuna, dosis: cantidadDosis}) 

    if (animal.length == 0) return res.status(404).json({error: 'No hemos encontrado ningún animal'})
    
    res.send(animal)
});

module.exports = router;
