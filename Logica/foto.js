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

// router.post('/imagen/add', async (req,res) => {
//    const {title, description} = req.body;
//    console.log(req.file); //informacion de la imagen
//    console.log(req.body); // datos cargados sobre la imagen titulo, etcs.
//    const result = await cloudinary.v2.uploader.upload(req.file.path); // toma el path de la foto que nos cargan desde el frontend
//    console.log(result)
//    const newFoto = new Foto ({
//        titulo,
//        descripcion,
//        imagenURL: result.url, // la url que guardo cuando cloudinary me sube la imagen
//        public_id: result.públic_id
//    })
//    await newFoto.save();
//    await fs.unlik(req.file.path);
//       let foto = new Foto({
//         titulo: req.body.titulo,
//         descripcion: req.body.descripcion,
//         public_id: req.body.public_id
//     })
//     result = await foto.save()
//     const jwtToken = foto.generateJWT()
//     {res.send('recibido ok');
// }
// });

//const fs = require('fs')
//const path = require('path')
router.post('/uploadimg', [multer.single('attachment')], (req, res, next) => {
    const multer = require('multer')({
        dest: 'Escritorio/files'//ruta
    })
    console.log(req.file)
    let foto = new Foto({
        id_foto: req.body.id_foto,
        titulo : req.body.titulo
    })
    if (req.file.length == 0) {
        responseb.error = true;
        responseb.mensaje = 'Ingrese una imagen';
        responseb.codigo = 400;
        res.status(400).send(responseb);

    } else {
        if (req.file.mimetype.indexOf('image') >= 0) {
            let { fileName } = storeWithOriginalName(req.file)
            responseb.error = true;
            responseb.mensaje = fileName;
            responseb.codigo = 200;
            res.status(200).send(responseb);

        } else {
            responseb.error = true;
            responseb.mensaje = 'Ingrese una imagen';
            responseb.codigo = 400;
            res.status(400).send(responseb);
        }


    }
});
module.exports = router;