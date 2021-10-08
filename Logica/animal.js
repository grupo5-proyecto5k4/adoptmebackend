const bcrypt = require('bcrypt')
const mongosee = require('mongoose')
const express = require('express')
const Animal = require('../modelos/animal.js')
const jwt = require('jsonwebtoken')
const router = express.Router()
const {check, validationResult } = require('express-validator');
const auth = require('../middleware/auth.js')
const { ObjectId } = require('mongodb');
const Foto = require('../modelos/foto.js')
const cloudinary = require('cloudinary');
const fs = require('fs-extra');
const Estados = require('../modelos/estados.js')
const { schema } = require('../modelos/estados.js')
const Vacuna = require('../modelos/vacuna.js')


 cloudinary.config({
     cloud_name: process.env.cloudname,
     api_key: process.env.apikey,
     api_secret: process.env.apisecret
 })


//Buscar un animal por un determinado id
router.get('/buscar', async function(req, res) {
    console.log('llega')

    const animal =  await Animal.find()
    console.log(animal)
    res.send(animal)
})

router.post('/animal', auth,  async function(req, res) {
    let userAux = req.user.user
    let castrado = true 
    if (req.body.castrado == 2) castrado = false 
    let estado = " "
    switch(req.body.estado){
        case 7 : 
           estado = "Disponible Adopción";
           break;
        case 8 : 
           estado = "Disponible Adopción y Provisorio";
           break;
        case 9 : 
           estado = "Disponible Provisorio";
           break;
        default: 
           estado = "Disponible Adopción y Provisorio";          
    }
      
  
    let animal = new Animal({
        tipoMascota: req.body.tipoMascota,
        nombreMascota : req.body.nombreMascota,
        fechaAlta: req.body.fechaAlta,
        fechaModificacion: req.body.fechaModificacion,
        tamañoFinal: req.body.tamañoFinal,
        fechaNacimiento: req.body.fechaNacimiento,
        sexo: req.body.sexo,
        raza: req.body.raza,
        estado: estado,
        responsableCategoria: req.body.responsableCategoria,
        responsableId: userAux._id,
        castrado: this.castrado,
        conductaNiños: req.body.conductaNiños,
        conductaPerros: req.body.conductaPerros,
        conductaGatos: req.body.conductaGatos,
        descripcion: req.body.descripcion,
        foto: req.body.foto
 })
   
const result = await animal.save()

const jwtToken = result.generateJWT()
 
console.log (result)

res.status(201).json({id_Animal: result._id})
});

// filtrar mascotas segun su estado
router.get('/animal/:estados', async(req, res)=>{
    let nueva = req.params.estados.replace(/_/g, " ")
    let animal = await Animal.find({estado : nueva}) 
    if (animal.length == 0) return res.status(200).json({mesage:'[]'})
    res.send(animal)
});

// filtrar mascotas segun su estado y segun el id del responsable
router.get('/respestados/:responestados', auth, async(req, res)=>{
    let nueva = req.params.responestados.replace(/_/g, " ")
    let userAux = req.user.user
    let animal = await Animal.find({responsableId : userAux._id, estado : nueva }) 
        
    if (animal.length == 0) return res.status(200).json({mesage:'[]'})
    res.send(animal)
});

//Filtrar mascota de un determinado estado ( x resp) y aplicar filtro: sexo, tipo animal(perro-gato)
//Tamaño, centro rescatista, barrio/zona
router.get('/filtrosMascota/:estadoAnimal/:sexoAnimal/:tipoAnimal/:tamanoAnimal/:barrioAnimal', auth, async(req, res)=>{
    let nuevoEstado = req.params.estadoAnimal.replace(/_/g, " ")
    let nuevousuario = req.user.user
    let nuevoSexo = req.params.sexoAnimal
    let nuevoTipoAnimal = req.params.tipoAnimal
    let nuevoTamanoAnimal = req.params.tamanoAnimal
    let nuevoBarrioAnimal = req.params.barrioAnimal
    if (nuevousuario.tipoUsuario != 0){
        let animalDevuelto = await Animal.find({estado : nuevoEstado, sexo: nuevoSexo, tipoMascota : nuevoTipoAnimal, tamañoFinal : nuevoTamanoAnimal, barrio : nuevoBarrioAnimal })
        if (animalDevuelto.length == 0) return res.status(400).json({mesage:'No existen animales que coincidan con los filtros deseados'})
        res.send(animalDevuelto)
    }
    else{
        return res.status(400).json({mesage:'El usuario tiene que ser particular o centro rescatista'})
    }
});

module.exports = router;
    


