const bcrypt = require('bcrypt')
const mongosee = require('mongoose')
const express = require('express')
const Estados = require('../modelos/estados.js')
const jwt = require('jsonwebtoken')
const router = express.Router()
const {check, validationResult } = require('express-validator');
const Barrio = require('../modelos/barrio.js')

// router.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header('Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE, PUT');
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
//   });

  router.get('/barrio', async function(req, res) {
    let barrio =  await Barrio.find();
    res.send(barrio)
})

router.post('/registrarBarrio', async function(req, res) {
    let nombreBarrio = (req.body.nombre).toUpperCase()
    let result = { error : "Exite el Barrio"}
    let b = await Barrio.findOne({nombre : nombreBarrio })
    if (!b) {
    let barrio = new Barrio({
        nombre : nombreBarrio
    })

     result = await barrio.save()
    
   }

res.send(result)
});

module.exports = router;