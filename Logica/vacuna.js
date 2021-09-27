const bcrypt = require('bcrypt')
const mongosee = require('mongoose')
const express = require('express')
const Vacuna = require('../modelos/vacuna.js')
const jwt = require('jsonwebtoken')
const router = express.Router()
const {check, validationResult } = require('express-validator');

const Animal = require('../modelos/animal.js')

router.get('/idvacuna', async function(req, res) {
    let vacuna =  await Vacuna.find();
    res.send(vacuna)
})

router.post('/vacuna', async function(req, res) {
    let Vacuna1 = req.body
    
    Vacuna1.forEach(async (element) => {
        console.log("elemento:" , element)
        let vac = new Vacuna({
            nombreVacuna : element.nombreVacuna,
            cantidadDosis: element.cantidadDosis,
            id_Animal: element.id_Animal
        })
        const result = await vac.save()
        const jwtToken = result.generateJWT()
    });     
       
    res.status(201).json({mensaje: 'vacuna creada correctamente'})
});

router.get('/filtrarVacunaAnimal/:idanimal', async function(req, res) {
    console.log(req.params.idanimal)
    let vacuna =  await Vacuna.find({id_Animal : req.params.idanimal});
    if (vacuna.length == 0) return res.status(200).json({error: 'El animal es un anti vacunas, maldito!'})
    res.send(vacuna)
})
  

module.exports = router;