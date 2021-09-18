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
    //let cuerpo = req.body
    //let Vacuna = cuerpo[0]
    //let dosis  = cuerpo[1] 
    //let id     = cuerpo[3]
    //console.log(cuerpo)
    //for (let index = 0;  Vacuna.length > index;  ++index ) {
        //let vacuna = new Vacuna({
            //nombreVacuna : Vacuna[index].nombreVacuna,
            //cantidadDosis: Vacuna[index].cantidadDosis,
            //id_Animal: id
        //})
    for (let index = 0;  req.file.length > index;  ++index ) {
            let vac = new Vacuna({
                nombreVacuna : req.body.nombreVacuna,
                cantidadDosis: req.body.cantidadDosis,
                id_Animal: req.body.id
            })
        const result = await vac.save()
        const jwtToken = result.generateJWT() 
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