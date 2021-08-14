const bcrypt = require('bcrypt')
const mongosee = require('mongoose')
const express = require('express')
const Animal = require('../modelos/animal.js')
const jwt = require('jsonwebtoken')
const router = express.Router()
const {check, validationResult } = require('express-validator');
const { schema } = require('../modelos/animal.js')

//Buscar un animal por un determinado id
router.get('/idAnimal', async function(req, res) {
    let animal =  await Animal.find();
    res.send(animal)
})

//Cargar un animal

router.post('/animal', async function(req, res) {
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
        castrado: req.body.castrado,
        conductaNiños: req.body.conductaNiños,
        conductaPerros: req.body.conductaPerros,
        conductaGatos: req.body.conductaGatos,
        descripcion: req.body.descripcion

    })
    
// filtrar mascotas segun su estado
router.get('/animal/:estados', async(req, res)=>{

    //let estados = await Estado.findOne({nombre : req.params.estado}) 

    //if (!animal) return res.status(404).json({error: 'El estado es inválido'})
    
    let animal = await Animal.findOne({estado : req.params.estado}) 
   
    if (animal.length == 0) return res.status(404).json({error: 'No hemos encontrado ningún animal que coincida con ese estado'})
    
    res.send(animal)
});


const result = await animal.save()
const jwtToken = result.generateJWT()

res.status(201).header('animal_creado', jwtToken).send()
});

module.exports = router;