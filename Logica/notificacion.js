const bcrypt = require('bcrypt')
const mongosee = require('mongoose')
const express = require('express')
const Notificacion = require('../modelos/notificacion.js')
const jwt = require('jsonwebtoken')
const router = express.Router()
const { check, validationResult } = require('express-validator');
const { schema } = require('../modelos/notificacion');
const webpush = require('web-push');
webpush.setVapidDetails(
    'mailto:grupo5.proyecto5k4@gmail.com', PUBLIC_VAPID_KEY, PRIVATE_VAPID_KEY
)

process.env.PUBLIC_VAPID_KEY = BInYYpxh7o4d9veKC9RBqogoi2qGPFwdriUe4RtYVz5SHlf8eXs22z1auQk6DpmwbJwUgvkdVpW6pWufcyCedNc;
process.env.PRIVATE_VAPID_KEY = TJR8cmSQZbY4okQlNWWb-Xt0msBNMbAqsE7oh98Yl6w;


router.get('/notificationes', async function (req, res) {
    let notificacion = await Notificacion.find();
    res.send(notificacion)
})

router.post('/notificacion', async function (req, res) {
   /*
    let notificacion = new Notificacion({
        id_notificacion: req.body.id_notificacion,
        descripcion: req.body.nombre
    })

    const result = await notificacion.save()
    const jwtToken = notificacion.generateJWT()

    */
    res.status(201).header('notificacion_creada', jwtToken).send()
});

module.exports = router;