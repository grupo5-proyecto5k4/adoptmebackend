const bcrypt = require('bcrypt')
const mongosee = require('mongoose')
const express = require('express')
const User = require('../modelos/usuarios.js')
const Estado = require('../modelos/estados.js')
//const { schema2 } = require('../modelos/usuarios.js')
const jwt = require('jsonwebtoken')
const router = express.Router()
const {check, validationResult } = require('express-validator');
const { schema } = require('../modelos/usuarios.js')
const auth = require('../middleware/auth.js')

router.use(function timelog(req, res, next){
    console.log('Time:', Date.now());
    next()
}); 

router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods','POST, GET, OPTIONS, DELETE, PUT');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,  auth-token");
    next();
  });

// router.get('/user', async function(req, res) {
//     let users =  await User.find();
//     res.send(users)
// });

router.options('/registro', async function(req, res)  {
    res.status(200).send('Ok - Options')
   
})

router.options('/login', async function(req, res)  {
    res.status(200).send('Ok - Options')
   
})

// login del usuario 

 
 router.post('/login', [
    check('correoElectronico').isLength({min: 3}),
    check('contrasenia').isLength({min: 8, max:15})
], async(req, res) => {
    const error = validationResult(req)
    if (!error.isEmpty){
        return res.status(400).json(
            {error: error.details[0].message}
        )
    }
    let user = await User.findOne({correoElectronico: req.body.correoElectronico})
    
    if(!user) return res.status(400).json({error: 'Usuario o contraseña inválida'})
    
    let validaContrasenia = await bcrypt.compare(req.body.contrasenia, user.contrasenia);
    let estado = await Estado.findOne ({nombre: 'Activo'})

    if(!validaContrasenia) return res.status(400).json({error: 'Usuario o contraseña inválida'})
    
    if (user.idEstado != estado.id_estado ) return res.status(400).json({error: 'Usuario inactivo'})
    
   
    //create token 

   const jwtToken = jwt.sign({user}, process.env.SECRET_KEY_JWT);

   res.header('auth-token', jwtToken ).json({
       token : jwtToken
    })

 })

 router.get('/login', auth, async function(req, res){
    
    let userAux = req.user.user
    let user = await User.findOne({correoElectronico: userAux.correoElectronico})
   
    if (!user)return res.status(400).json({error: 'Datos del Usuario Logueado incorrectos'})
     res.send({
        _id: user._id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        dni: user.dni,
        Direccion:user.Direccion,
        fechaNacimiento: user.fechaNacimiento,
        facebook: user.facebook, 
        instagram: user.instagram,
        correoElectronico: user.correoElectronico,
        tipoUsuario: user.tipoUsuario,
        numeroContacto: user.numeroContacto,
        idEstado: user.idEstado,
        fechaCreacion: user.fechaCreacion,
        fechaModificacion:user.fechaModificacion
    })


 })

// Registro del Usuario 
router.post('/registro', [
    check('nombres').isLength({min: 3}),
    check('correoElectronico').isLength({min: 3}),
    check('contrasenia').isLength({min: 8, max:15})
],async function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
  }

    let user = await User.findOne({correoElectronico: req.body.correoElectronico})
    
    if(user) return res.status(400).json({error:'El email se encuentra registrado.'})
      
    
    user = await User.findOne({dni: req.body.dni})
    
    if(user && req.body.dni != undefined ) return res.status(400).json({error:'El DNI se encuentra registrado.'})
  
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(req.body.contrasenia, salt)
    // tipo de usuario y estado 
     var tipoUsuarios = 1
     var estado = await Estado.findOne({nombre: "Activo"})
     if (req.body.dni == undefined)  {
         tipoUsuarios = 2
         estado = await Estado.findOne({nombre: "Pendiente"})
     }
    
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
        tipoUsuario: tipoUsuarios, 
        numeroContacto: req.body.numeroContacto,
        idEstado: estado.id_estado,
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

router.get('/centros/:estados', auth, async(req, res)=>{
        let userAux = req.user.user 
        
        if (userAux.tipoUsuario != 0) return res.status(404).json({error: 'No tiene permisos para este accion'})
        let estados = await Estado.findOne({nombre : req.params.estados}) 
       
        if (!estados) return res.status(404).json({error: 'El estado es invalido'})
         
        let users = await User.find({idEstado : estados.id_estado, tipoUsuario: 2 })
 
        if(users.length == 0) return res.status(404).json({error: 'No hemos encontrado un Centro Rescatista en ese estado'})
        
        res.send(users)
});





// no se usa por ahora 
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

router.delete('/:correoElectronico', async(req, res)=>{
    
    const user = await User.findOneAndDelete({correoElectronico: req.params.correoElectronico})

    if(!user){
        return res.status(404).send('El user con ese ID no esta, no se puede borrar')
    }
    
    res.status(200).send('usuario borrado')

});

module.exports = router;

