const bcrypt = require('bcrypt')
const mongosee = require('mongoose')
const express = require('express')
const Vacuna = require('../modelos/vacuna.js')
const jwt = require('jsonwebtoken')
const router = express.Router()
const {check, validationResult } = require('express-validator');
const { schema } = require('../modelos/vacuna.js')

router.get('/idvacuna', async function(req, res) {
    let vacuna =  await Estados.find();
    res.send(vacuna)
})

router.post('/vacuna', async function(req, res) {
    let vacuna = new Vacuna({
        nombre : req.body.nombre,
        cantidadDosis: req.body.cantidadDosis
    })

const result = await vacuna.save()
const jwtToken = vacuna.generateJWT()


res.status(201).header('vacuna creada correctamente', jwtToken).send()
});

module.exports = router;