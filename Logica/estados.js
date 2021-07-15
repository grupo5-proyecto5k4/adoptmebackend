const bcrypt = require('bcrypt')
const mongosee = require('mongoose')
const express = require('express')
const Estados = require('../modelos/estados.js')
const jwt = require('jsonwebtoken')
const router = express.Router()
const {check, validationResult } = require('express-validator');
const { schema } = require('../modelos/estados.js')

// router.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header('Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE, PUT');
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
//   });

  router.get('/:id_estado', async function(req, res) {
    let estados =  await Estados.findOne({id_estado:req.body.id_estado});
    res.send(estados)
});

router.post('/estado', async function(req, res) {
    let estados = new Estados({
        id_estado: req.body.id_estado,
        nombre: req.body.nombre
    })

const result = await estados.save()
const jwtToken = estados.generateJWT()

res.status(201).header('estado_creado', jwtToken).send()
});

module.exports = router;