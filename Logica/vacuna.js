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
    for (let index = 0;  req.body.Vacuna.length > index;  ++index ) {
        let vacuna = new Vacuna({
            nombreVacuna : req.body.Vacuna[index].nombreVacuna,
            cantidadDosis: req.body.Vacuna[index].cantidadDosis,
            id_Animal: req.body.id_Animal
        })
        const result = await vacuna.save()
}

  
const jwtToken = vacuna.generateJWT()

res.status(201).header('vacuna creada correctamente', jwtToken).send()
});

router.get('/filtrarVacunaAnimal/:idanimal', async function(req, res) {
    console.log(req.params.idanimal)
    let vacuna =  await Vacuna.find({id_Animal : req.params.idanimal});
    if (vacuna.length == 0) return res.status(200).json({error: 'El animal es un anti vacunas, maldito!'})
    res.send(vacuna)
})
  

module.exports = router;