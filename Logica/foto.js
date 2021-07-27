const bcrypt = require('bcrypt')
const mongosee = require('mongoose')
const express = require('express')
const Foto = require('../modelos/foto.js')
const jwt = require('jsonwebtoken')
const router = express.Router()
const {check, validationResult } = require('express-validator');
const { schema } = require('../modelos/foto.js')
// const cloudinary = requiere ('cloudinary');
// cloudinary.config({
// cloudname: 'dsfz7jmoi',
// apikey: '281974651216952',
// apisecret: 'RKGzfGl_WhyjnoOevR6MZTLl-mc'
// });
// const fs = requiere('fs-extra');
// router.get('/', (req,res) => {
//     res.render('imagen');
// });

router.get('/imagen', async (req,res) => {
    let foto =  await Foto.find();
    res.send(foto);
});

router.post('/imagen/add', async (req,res) => {
   const {title, description} = req.body;
   console.log(req.file); //informacion de la imagen
   console.log(req.body); // datos cargados sobre la imagen titulo, etcs.
   const result = await cloudinary.v2.uploader.upload(req.file.path); // toma el path de la foto que nos cargan desde el frontend
   console.log(result)
   const newFoto = new Foto ({
       titulo,
       descripcion,
       imagenURL: result.url, // la url que guardo cuando cloudinary me sube la imagen
       public_id: result.públic_id
   })
   await newFoto.save();
   await fs.unlik(req.file.path);
      let foto = new Foto({
        titulo: req.body.titulo,
        descripcion: req.body.descripcion,
        public_id: req.body.public_id
    })
    const result = await foto.save()
    const jwtToken = foto.generateJWT()
    {res.send('recibido ok');
}
});
module.exports = router;