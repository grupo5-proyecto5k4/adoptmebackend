const bcrypt = require('bcrypt')
const mongosee = require('mongoose')
const express = require('express')
const User = require('../modelos/usuarios.js')
const Estado = require('../modelos/estados.js')
//const { schema2 } = require('../modelos/usuarios.js')
const jwt = require('jsonwebtoken')
const router = express.Router()
const { check, validationResult } = require('express-validator');
const { schema } = require('../modelos/usuarios.js')
const auth = require('../middleware/auth.js')
const ahora = require('../fecha.js')
const Animal = require('../modelos/animal.js')
const Adopcion = require('../Formulario/adopcion.js')
const Provisorio = require('../Formulario/provisorio.js')
const FormularioAdopcion = require('../Formulario/adopcion.js')
const FormularioProvision = require('../Formulario/provisorio.js')

router.use(function timelog(req, res, next) {
    console.log('Time:', ahora.ahora());
    next()
});

router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PUT');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,  auth-token");
    next();
});



router.options('/registro', async function (req, res) {
    res.status(200).send('Ok - Options')

})

router.options('/login', async function (req, res) {
    res.status(200).send('Ok - Options')

})

// login del usuario 


router.post('/login', [
    check('correoElectronico').isLength({ min: 3 }),
    check('contrasenia').isLength({ min: 8, max: 15 })
], async (req, res) => {
    const error = validationResult(req)
    if (!error.isEmpty) {
        return res.status(400).json(
            { error: error.details[0].message }
        )
    }
    let user = await User.findOne({ correoElectronico: req.body.correoElectronico })

    if (!user) return res.status(400).json({ error: 'Oops... El email ingresado no está registrado. Creá una cuenta para continuar' })

    let validaContrasenia = await bcrypt.compare(req.body.contrasenia, user.contrasenia);



    if (!validaContrasenia) return res.status(400).json({ error: 'Oops... La contraseña que ingresaste es incorrecta' })

    // if (user.idEstado != estado.id_estado ) return res.status(400).json({error: 'Usuario inactivo, comuníquese con el administrador desde la sección contáctanos'})
    let estado = await Estado.findOne({ nombre: 'Activo' })
    if (user.idEstado != estado.id_estado) return res.status(400).json(
        { error: 'Oops... Tu cuenta todavía está siendo analizada para ser habilitada' }
    )

    //create token 

    const jwtToken = jwt.sign({ user }, process.env.SECRET_KEY_JWT);

    res.header('auth-token', jwtToken).json({
        token: jwtToken
    })

})

router.get('/login', auth, async function (req, res) {

    let userAux = req.user.user
    let user = await User.findOne({ correoElectronico: userAux.correoElectronico })

    if (!user) return res.status(400).json({ error: 'Datos del Usuario Logueado incorrectos' })
    res.send({
        _id: user._id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        dni: user.dni,
        Direccion: user.Direccion,
        fechaNacimiento: user.fechaNacimiento,
        facebook: user.facebook,
        instagram: user.instagram,
        correoElectronico: user.correoElectronico,
        tipoUsuario: user.tipoUsuario,
        numeroContacto: user.numeroContacto,
        idEstado: user.idEstado,
        fechaCreacion: user.fechaCreacion,
        fechaModificacion: user.fechaModificacion
    })


})

// Registro del Usuario 
router.post('/registro', [
    check('nombres').isLength({ min: 3 }),
    check('correoElectronico').isLength({ min: 3 }),
    check('contrasenia').isLength({ min: 8, max: 15 })
], async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    let user = await User.findOne({ correoElectronico: req.body.correoElectronico })

    if (user) return res.status(400).json({ error: 'El email se encuentra registrado.' })


    user = await User.findOne({ dni: req.body.dni })

    if (user && req.body.dni != undefined) return res.status(400).json({ error: 'El DNI se encuentra registrado.' })

    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(req.body.contrasenia, salt)
    // tipo de usuario y estado 
    var tipoUsuarios = 1
    var estado = await Estado.findOne({ nombre: "Activo" })
    if (req.body.dni == undefined) {
        tipoUsuarios = 2
        estado = await Estado.findOne({ nombre: "Pendiente" })
    }
    let nombre = req.body.nombres
    let apellido = req.body.apellidos
    if (req.body.nombres != undefined) nombre = (req.body.nombres).toUpperCase()
    if (req.body.apellidos != undefined) apellido = (req.body.apellidos).toUpperCase()

    user = new User({
        nombres: nombre,
        apellidos: apellido,
        dni: req.body.dni,
        fechaNacimiento: req.body.fechaNacimiento,
        Direccion: req.body.Direccion,
        instagram: req.body.instagram,
        facebook: req.body.facebook,
        correoElectronico: req.body.correoElectronico,
        contrasenia: hashPassword,
        tipoUsuario: tipoUsuarios,
        numeroContacto: req.body.numeroContacto,
        idEstado: estado.id_estado,
        fechaCreacion: req.body.fechaCreacion,
        fechaModificacion: req.body.fechaModificacion,
        banco: req.body.banco,
        cbu: req.body.cbu,
        alias: req.body.alias
    })

    const result = await user.save()

    const jwtToken = user.generateJWT();

    res.status(201).header('Authorization', jwtToken).send({
        _id: user._id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        dni: user.dni,
        fechaNacimiento: user.fechaNacimiento,
        Direccion: user.Direccion,
        instagram: user.instagram,
        facebook: user.facebook,
        correoElectronico: user.correoElectronico,
        password: hashPassword,
        tipoUsuario: user.tipoUsuario,
        numeroContacto: user.numeroContacto,
        idEstado: user.idEstado,
        fechaCreacion: user.fechaCreacion

    })



});

router.options('/centros/:estados', async function (req, res) {
    res.status(200).send('Ok - Options')

})

router.options('/centros/:id_centro', async function (req, res) {
    res.status(200).send('Ok - Options')

})



router.get('/centros/:estados', auth, async (req, res) => {
    let userAux = req.user.user

    if (userAux.tipoUsuario != 0) return res.status(404).json({ error: 'No tiene permisos para este accion' })
    let estados = await Estado.findOne({ nombre: req.params.estados })

    if (!estados) return res.status(404).json({ error: 'El estado es invalido' })

    let users = await User.find({ idEstado: estados.id_estado, tipoUsuario: 2 })

    if (users.length == 0) return res.status(404).json({ error: 'No hemos encontrado un Centro Rescatista en ese estado' })

    res.send(users)
});

// filtro de Centros en estado Pendiente por nombre y/o barrio
router.get('/centrosFiltro/filtroBarrioNombres', auth, async (req, res) => {
    let userAux = req.user.user

    var filter = "{"

    const { nombres, barrio } = req.query;


    if (userAux.tipoUsuario != 0) return res.status(404).json({ error: 'No tiene permisos para este accion' })
    let estados = await Estado.findOne({ nombre: "Pendiente" })

    if (!estados) return res.status(404).json({ error: 'El estado es invalido' })

    if (barrio) filter += '"Direccion.barrio": "' + barrio + '", '
    filter += '"tipoUsuario" : 2, '
    filter += '"idEstado" : ' + estados.id_estado
    filter += "}"


    var f = JSON.parse(filter)

    if (nombres) f.nombres = { $regex: '.*' + (nombres).toUpperCase() + '.*' }

    let users = await User.find(f)

    if (users.length == 0) users = []

    res.send(users)
});

// filtro de Usuario  por nombre y/o Apellido 
router.get('/particularFiltro/filtroNombresApellidos', auth, async (req, res) => {
    let userAux = req.user.user

    const filter = {}
    const { nombres, apellidos, estado } = req.query;


    if (userAux.tipoUsuario != 0) return res.status(404).json({ error: 'No tiene permisos para este accion' })

    if (estado) {
        let estados = await Estado.findOne({ nombre: estado })

        if (!estados) return res.send([])
        filter.idEstado = estados.id_estado
    }
    var nombreMay = (nombres).toUpperCase()
    if (nombres) filter.nombres = { $regex: '.*' + nombreMay + '.*' }
    if (apellidos) filter.apellidos = apellidos
    // filter.tipoUsuario = 1
    console.log(filter)

    let users = await User.find(filter)

    if (users.length == 0) users = []

    res.send(users)
});

// filtro de centro Rescatista para donar
router.get('/centrosParaDonar/filtroDonar', async (req, res) => {

    var filter = "{"
    const { nombres, barrio } = req.query;


    if (nombres) filter += '"nombres": "' + (nombres).toUpperCase() + '", '
    if (barrio) filter += '"Direccion.barrio": "' + barrio + '", '
    filter += '"tipoUsuario" : 2 '
    filter += "}"

    var f = JSON.parse(filter)

    f.banco = { $nin: [undefined, null, ""] }
    f.cbu = { $nin: [undefined, null, ""] }
    f.alias = { $nin: [undefined, null, ""] }

    let users = await User.find(f)

    if (users.length == 0) users = []

    res.send(users)
});


//trae todos los estados, tanto si son particulares o centros rescatistas
router.get('/usuarios/:estados', auth, async (req, res) => {
    let userAux = req.user.user

    if (userAux.tipoUsuario != 0) return res.status(404).json({ error: 'No tiene permisos para esta accion' })

    let estados = await Estado.findOne({ nombre: req.params.estados })

    if (!estados) return res.status(404).json({ error: 'El estado es invalido' })

    let users = await User.find({ idEstado: estados.id_estado })

    if (users.length == 0) return res.status(404).json({ error: 'No hemos encontrado un Usuarios en ese estado' })

    res.send(users)

});



// habilitar centros rescatista por su id 

router.put('/centros/:id_centro', auth, async (req, res) => {
    let userAux = req.user.user

    if (userAux.tipoUsuario != 0) return res.status(404).json({ error: 'No tiene permisos para este accion' })

    let user = await User.findByIdAndUpdate(req.params.id_centro,
        {
            idEstado: req.body.idEstado,
            fechaModificacion: ahora.ahora()

        }, {
        new: true
    })

    //chequear si se está bloqueando al usuario
    if (req.body.idEstado == 3) {
        //recorrer sus mascotas
        let mascotas = await Animal.find({ responsableId: user._id })
        if (mascotas.length != undefined) {
            for (let i = 0; i < mascotas.length; i++) {
                //si su mascota esta disponible (los 3 estados) pasar el campo visible a False
                if (mascotas[i].estado == "Disponible adopción" || mascotas[i].estado == "Disponible Adopción y provisorio" || mascotas[i].estado == "Disponible provisorio") {
                    await Animal.findByIdAndUpdate(mascotas[i]._id,
                        {
                            visible: false,
                            fechaModificacion: ahora.ahora()
                        }, {
                        new: true
                    })
                }


                //recorrer las solicitudes cuyo id sea el de la mascota y qu esten en estado abierta
                let solicitudesAdop = await FormularioAdopcion.find({ mascotaId: mascotas[i]._id })
                //actualizar las solicitudes abiertas y pasarlas al estado suspendida
                if (solicitudesAdop.length != undefined) {
                    for (let x = 0; x < solicitudesAdop.length; x++) {
                        //si su mascota esta disponible (los 3 estados) pasar el campo visible a False
                        if (solicitudesAdop[x].estadoId == "Abierta" || solicitudesAdop[x].estadoId == "Aprobado Por Responsable") {
                            await FormularioAdopcion.findByIdAndUpdate(solicitudesAdop[x]._id,
                                {
                                    estadoId: "Suspendido",
                                    fechaModificacion: ahora.ahora()
                                }, {
                                new: true
                            })
                        }
                    }
                }


                //recorrer las solicitudes cuyo id sea el de la mascota y qu esten en estado abierta
                let solicitudesProv = await FormularioProvision.find({ mascotaId: mascotas[i]._id })
                //actualizar las solicitudes abiertas y pasarlas al estado suspendida
                if (solicitudesProv.length != undefined) {
                    for (let y = 0; y < solicitudesProv.length; y++) {
                        //si su mascota esta disponible (los 3 estados) pasar el campo visible a False
                        if (solicitudesProv[y].estadoId == "Abierta" || solicitudesProv[y].estadoId == "Aprobado Por Responsable") {
                            await FormularioProvision.findByIdAndUpdate(solicitudesProv[y]._id,
                                {
                                    estadoId: "Suspendido",
                                    fechaModificacion: ahora.ahora()
                                }, {
                                new: true
                            })
                        }
                    }
                }
            }


        }


    }



    // chequear si se está activando nuevamente al usuario
    else if (req.body.idEstado == 1) {
        //recorrer sus mascotas
        let mascotas = await Animal.find({ responsableId: user._id })
        if (mascotas.length != undefined) {
            for (let i = 0; i < mascotas.length; i++) {
                //si su mascota esta disponible (los 3 estados) pasar el campo visible a TRUE
                if (mascotas[i].estado == "Disponible adopción" || mascotas[i].estado == "Disponible Adopción y provisorio" || mascotas[i].estado == "Disponible provisorio") {
                    await Animal.findByIdAndUpdate(mascotas[i]._id,
                        {
                            visible: true,
                            fechaModificacion: ahora.ahora()
                        }, {
                        new: true
                    })
                }
            }

        }

    }




    if (!user) return res.status(404).json({ error: 'No se ha encontrado el Centro Rescatista indicado' })


    if (user.idEstado == 1) return res.status(200).json({ mensaje: 'El Centro Rescatista ha sido habilitado' })
    if (user.idEstado != 1) return res.status(200).json({ mensaje: 'El Centro Rescatista ha sido rechazado' })

});




router.get('/user/modificacionPerfil', auth, async function (req, res) {
    let userAux = req.user.user

    let n = await User.findById({ _id: userAux._id })
    if (!n) return res.status(401).json({ error: "no se encontro ese usuario" })
    res.send(n)

})


router.put('/user/modificacionPerfil', auth, async function (req, res) {
    let userAux = req.user.user
    let n = await User.findById({ _id: userAux._id })
    let p = req.body
    let val_user = User
    if (p.nombres && n.nombres != (p.nombres).toUpperCase()) n.nombres = (p.nombres).toUpperCase()
    if (p.apellidos && n.apellidos != (p.apellidos).toUpperCase()) n.apellidos = (p.apellidos).toUpperCase()
    if (n.dni != p.dni && p.dni) n.dni = p.dni
    if (n.fechaNacimiento != p.fechaNacimiento && p.fechaNacimiento) n.fechaNacimiento = p.fechaNacimiento
    if (n.Direccion != p.Direccion && p.Direccion) n.Direccion = p.Direccion
    if (n.instagram != p.instagram && p.instagram) n.instagram = p.instagram
    if (n.facebook != p.facebook && p.facebook) n.facebook = p.facebook
    if (n.numeroContacto != p.numeroContacto && p.numeroContacto) n.numeroContacto = p.numeroContacto

    const salt = await bcrypt.genSalt(10) //para desencriptar la contraseña

    if (p.contrasenia) {
        let validaContrasenia = await bcrypt.compare(p.contrasenia, n.contrasenia)
        if (!validaContrasenia) n.contrasenia = await bcrypt.hash(p.contrasenia, salt)

    }
    n.fechaModificacion = ahora.ahora() //grabar la fecha actual
    let result = await User.findByIdAndUpdate(n._id, n, { new: true }) //aca se actualiza el usuario

    if (!result) return res.status(400).json({ mensaje: 'no se pudo realizar la actualizacion' })

    let user = await User.findById({ _id: n._id })

    const jwtToken = jwt.sign({ user }, process.env.SECRET_KEY_JWT);

    res.header('auth-token', jwtToken).json({
        token: jwtToken
    })

})

/* modificar datos centro rescatista*/
router.put('/user/modificacion/centrorescatista', auth, async function (req, res) {
    let userAux = req.user.user
    if (userAux.tipoUsuario != 0) return res.status(404).json({ error: 'No tiene permisos para este accion' })

    let usuario = await User.findById({ _id: req.body._id })
    if (usuario.tipoUsuario != 2) return res.status(404).json({ error: ' no corresponde a este usuario' })


    let result = await User.findByIdAndUpdate(usuario._id,
        {
            banco: (req.body.banco).toUpperCase(),
            cbu: req.body.cbu,
            alias: (req.body.alias).toUpperCase(),
            fechaModificacion: ahora.ahora()
        },
        { new: true }
    )

    if (!result) return res.status(400).json({ error: ' No se grabo correctamente' })
    res.send(result)

})

router.get('/user/modificacion/centrorescatista/:id_Centro', auth, async function (req, res) {

    let userAux = req.user.user
    if (userAux.tipoUsuario != 0) return res.status(404).json({ error: 'No tiene permisos para este accion' })

    let usuario = await User.findById({ _id: req.params.id_Centro })

    if (usuario.tipoUsuario != 2) return res.status(404).json({ error: 'no corresponde a este usuario' })


    if (!usuario) return res.status(401).json({ error: "no se encontro ese usuario" })

    res.send(usuario)

})

router.get('/donaciones/centroRescatistas', async function (req, res) {
    let centro = 2
    let donativos = await User.find({
        tipoUsuario: centro,
        banco: { $nin: [undefined, null, ""] },
        cbu: { $nin: [undefined, null, ""] },
        alias: { $nin: [undefined, null, ""] }


    })

    res.send(donativos)
})

module.exports = router;

