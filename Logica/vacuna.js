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
    let cuerpo = req.body
    let Vacuna = cuerpo[0] 
    let id     = cuerpo[1]
    console.log(req.body)
    for (let index = 0;  Vacuna.length > index;  ++index ) {
        let vacuna = new Vacuna({
            nombreVacuna : Vacuna[index].nombreVacuna,
            cantidadDosis: Vacuna[index].cantidadDosis,
            id_Animal: Vacuna[index].id_Animal
        })
        //const result = await vacuna.save()
        //const jwtToken = vacuna.generateJWT()
        const result = await Vacuna.save()
        const jwtToken = Vacuna.generateJWT()
}
res.status(201).json({mensaje: 'vacuna creada correctamente'})
});

router.get('/filtrarVacunaAnimal/:idanimal', async function(req, res) {
    console.log(req.params.idanimal)
    let vacuna =  await Vacuna.find({id_Animal : req.params.idanimal});
    if (vacuna.length == 0) return res.status(200).json({error: 'El animal es un anti vacunas, maldito!'})
    res.send(vacuna)
})
  

module.exports = router;