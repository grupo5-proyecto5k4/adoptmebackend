const bcrypt = require('bcrypt')
const mongosee = require('mongoose')
const express = require('express')
const Foto = require('../modelos/foto.js')
const jwt = require('jsonwebtoken')
const router = express.Router()
const {check, validationResult } = require('express-validator');
const { schema } = require('../modelos/foto.js')


router.get('/imagen', async (req,res) => {
    let foto =  await Foto.find();
    res.send(foto);
});

router.post('/imagen/add', async (req,res) => {
     newFoto = new Foto ({
       titulo: req.body.titulo,
       descripcion: req.body.descripcion,
       imagenURL: req.body.imagenURL // la url que guardo cuando cloudinary me sube la imagen
       //public_id: result.públic_id
   })
   let resultado = await newFoto.save()
   res.sendStatus(400).json({error: 'Error, no llegamos'})
});


module.exports = router;