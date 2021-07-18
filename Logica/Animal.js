const bcrypt = require('bcrypt')
const mongosee = require('mongoose')
const express = require('express')
const Animal = require('../modelos/animal.js')
const jwt = require('jsonwebtoken')
const router = express.Router()
const {check, validationResult } = require('express-validator');
const { schema } = require('../modelos/animal.js')

router.get('/idAnimal', async function(req, res) {
    let animal =  await Animal.find();
    res.send(animal)
})

router.post('/animal', async function(req, res) {
    let animal = new Animal({
        idAnimal: req.body.idAnimal,
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
const jwtToken = estados.generateJWT()


res.status(201).header('animal_creado', jwtToken).send()
});

module.exports = router;