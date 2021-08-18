const bcrypt = require('bcrypt')
const mongosee = require('mongoose')
const express = require('express')
const Animal = require('../modelos/animal.js')
const jwt = require('jsonwebtoken')
const router = express.Router()
const {check, validationResult } = require('express-validator');
const { schema } = require('../modelos/animal.js')

router.get('/idAnimal', async(req, res)=> {
    console.log('llego aca aca')
    let animal =  await Animal.find()
    console.log('animal', animal )
    res.send(animal)
})

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

const result = await animal.save()
const jwtToken = result.generateJWT()


res.status(201).header('animal_creado', jwtToken).send()
});

router.get('/animal', async(req, res)=>{

    
    let animal = await Animal.find({estado : req.body.estado}) 

    console.log(req.body.estado)
   
    if (animal.length == 0) return res.status(404).json({error: 'No hemos encontrado ningún animal que coincida con ese estado'})
    
    res.send(animal)
});

module.exports = router;