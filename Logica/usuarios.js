const bcrypt = require('bcrypt')
const mongosee = require('mongoose')
const express = require('express')
const User = require('../modelos/usuarios.js')
const router = express.Router()
const {check, validationResult } = require('express-validator');

router.use(function timelog(req, res, next){
    console.log('Time:', Date.now());
    next()
}); 

router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE, PUT');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });



router.get('/user', async function(req, res) {
    let users =  await User.find();
    console.log("get llega")
    res.send(users)
});

router.options('/registro', async function(req, res)  {
    console.log("hola  vos : ", req.body.nombres)
   
    // res.writeHead(200, {"Content-Type": "application/json"});
    // res.end();
    res.status(200).send('Fijate si se grabo')
   
})

router.post('/registro', [
    check('nombres').isLength({min: 3}),
    check('correoElectronico').isLength({min: 3}),
    check('contrasenia').isLength({min: 8, max:15})
],async function(req, res) {
    console.log("hola", req.body.nombres)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
  }

    let user = await User.findOne({correoElectronico: req.body.correoElectronico})
    
    if(user) return res.status(400).send('Ese usuario ya existe')
    
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(req.body.contrasenia, salt)
    
    user = new User({
        nombres: req.body.nombres,
        apellidos:req.body.apellidos,
        dni:req.body.dni,
        fechaNacimiento:req.body.fechaNacimiento,
        Direccion:req.body.Direccion, 
        instagram:req.body.instagram,
        facebook:req.body.facebook,
        correoElectronico: req.body.correoElectronico,
        contrasenia: hashPassword,
        tipoUsuario: req.body.tipoUsuario, 
        numeroContacto: req.body.numeroContacto,
        idEstado: req.body.idEstado,
        fechaCreacion: req.body.fechaCreacion,
        fechaModificacion:req.body.fechaModificacion
    })

    const result = await user.save()

    const jwtToken = user.generateJWT();

    res.status(201).header('Authorization', jwtToken).send({
        _id: user._id,
        nombres: user.nombres,
        apellidos:user.apellidos,
        dni:user.dni,
        fechaNacimiento:user.fechaNacimiento,
        Direccion: user.Direccion, 
        instagram:user.instagram,
        facebook:user.facebook,
        correoElectronico: user.correoElectronico,
        password: hashPassword,
        tipoUsuario: user.tipoUsuario, 
        numeroContacto: user.numeroContacto,
        idEstado: user.idEstado,
        fechaCreacion: user.fechaCreacion

    })
    
    
});

router.get('/:correoElectronico', async(req, res)=>{
    let user = await User.findById(req.params.correoElectronico)
    if(!user) return res.status(404).send('No hemos encontrado un usuario con ese ID')
    res(user)
});

router.put('/:id', [
    check('nombres').isLength({min: 3}),
    check('apellidos').isLength({min: 3}),
    check('dni').isLength({min:6, max: 8}),
    check('correoElectronico').isLength({min: 3}),
    check('contrasenia').isLength({min: 8, max:15})
], async (req, res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const user = await User.findByIdAndUpdate(req.params.id,{
        nombres: req.body.nombres,
        apellidos:req.body.apellidos,
        dni:req.body.dni,
        fechaNacimiento:req.body.fechaNacimiento,
        Direccion:req.body.Direccion, 
        instagram:req.body.instagram,
        facebook:req.body.facebook,
        correoElectronico: req.body.correoElectronico,
        password: hashPassword,
        tipoUsuario: req.body.tipoUsuario,
        numeroContacto: req.body.numeroContacto,
        idEstado: req.body.idEstado,
        fechaCreacion: req.body.fechaCreacion
    },
    {
        new: true
    })

    if(!user){
        return res.status(404).send('El usuario con ese ID no esta')
    }
    
    res.status(204).send()
})

router.delete('/:id', async(req, res)=>{

    const user = await User.findByIdAndDelete(req.params.id)

    if(!user){
        return res.status(404).send('El user con ese ID no esta, no se puede borrar')
    }

    res.status(200).send('usuario borrado')

});

module.exports = router;

