const bcrypt = require('bcrypt')
const mongosee = require('mongoose')
const express = require('express')
const Foto = require('../modelos/foto.js')
const jwt = require('jsonwebtoken')
const router = express.Router()
const { check, validationResult } = require('express-validator');
const { schema, eventNames } = require('../modelos/foto.js');
const cloudinary = require('cloudinary')
const fs = require('fs-extra')
const Adopcion = require('../Formulario/adopcion.js')
const auth = require('../middleware/auth.js')
const Animal = require('../modelos/animal.js')
const Provisorio = require('../Formulario/provisorio.js')
const User = require('../modelos/usuarios.js')
const Seguimiento = require('../modelos/seguimiento.js')
const Notificacion = require('../Logica/notificacion.js').notificar;

router.post('/crearSeguimiento', auth, async function (req, res) {
    let seguimiento = await Seguimiento.find({ SolicitudId: req.body._id })
    let estado = "Iniciado"
    if (seguimiento.length != 0) return res.status(401).json({ error: "el seguimiento ya existe" })
    seguimiento = new Seguimiento({
        SolicitudId: req.body._id,
        estadoId: estado,
        cadaCuanto: req.body.cadaCuanto,
    })
    const result = await seguimiento.save()
    if (!result) return res.status(401).json({ error: "No se grabo correctamente" })

    res.send(result)
})

router.put('/modificarSeguimiento', auth, async function (req, res) {
    let userAux = req.user.user
    let seg = await Seguimiento.findById({ _id: req.body.seguimientoId })
    let f = {
        descripcion: req.body.descripcion,
        fecha: new Date(Date.now()).toISOString()
    }
    let visita = seg.Visita
    visita.push(f)
    if (seg) {
        await Seguimiento.findByIdAndUpdate(seg._Id,
            {
                Visita: visita,
                fechaModificacion: new Date(Date.now()).toISOString()
            },
            { new: true }

        )
    }
})


module.exports = router;