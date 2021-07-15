const bcrypt = require('bcrypt')
const mongosee = require('mongoose')
const express = require('express')
const Estados = require('../modelos/estados.js')
const jwt = require('jsonwebtoken')
const router = express.Router()
const {check, validationResult } = require('express-validator');
const { schema } = require('../modelos/estados.js')



  router.get('/idestado', async function(req, res) {
    let estados =  await Estados.find();
    res.send(estados)
})

router.post('/estado', async function(req, res) {
    let estados = new Estados({
        idestado: req.body.idestado,
        nombre : req.body.nombre
    })

const result = await estados.save()
const jwtToken = estados.generateJWT()

res.status(201).header('Authorization', jwtToken).send("conecto")
});

module.exports = router;