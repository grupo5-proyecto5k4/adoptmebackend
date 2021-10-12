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
const Usuario = require('../modelos/usuarios.js')
//const {Schema, model} = require("mongoose")


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

//Traer todas las mascotas que cumplen con los filtros, en gral, no responden a un det usuario
router.get('/filtrosMascota/filtroAnimal', auth, async(req, res)=>{
    const filter = {}
    if(req.body.estado)filter.estado = req.body.estado 
    if(req.body.sexo) filter.sexo = req.body.sexo
    if(req.body.tamañoFinal) filter.tamanoFinal = req.body.tamanoFinal
    if(req.body.tipoAnimal) filter.tipoAnimal = req.body.tipoAnimal
    let animalDevuelto = await Animal.find(filter)
    if (animalDevuelto.length == 0) return res.status(400).json({mesage:'No existen animales que coincidan con los filtros deseados'})
    res.send(animalDevuelto)
})

//Filtrar las mascotas por los filtros del item anterior y ademas filtrar en funcion
//de los datos del centro recatista (barrio del centro y nombre del centro)
router.get('/filtrosMascota/filtroAnimalCentroResc', async(req, res)=>{
    const filter2 = {}
    let filtroDevuelto = []

    if(req.body.estado)filter2.estado = req.body.estado 
    if(req.body.sexo) filter2.sexo = req.body.sexo
    if(req.body.tamañoFinal) filter2.tamanoFinal = req.body.tamanoFinal
    if(req.body.tipoAnimal) filter2.tipoAnimal = req.body.tipoAnimal
    
    let animalDevuelto = await Animal.find(filter2)
    if(animalDevuelto.length == 0) return res.status(400).json({mesage:'Error'})
    
    for (let i = 0 ; i < animalDevuelto.length ; i ++ ){
            const filter4 = {} 
            if(req.body.nombres)filter4.nombres = req.body.nombres
            if(req.body.Direccion)filter4.Direccion = req.body.Direccion
            filter4._id = animalDevuelto[i].responsableId
            let usuarioDevueltoNew = await Usuario.findById(filter4)
            if(!usuarioDevueltoNew) continue
            var nuevoArreglo = {
                Animal: animalDevuelto[i], 
                Usuarios:{  Direccion: usuarioDevueltoNew.Direccion,
                            nombres: usuarioDevueltoNew.nombres} 
                }
            filtroDevuelto.push(nuevoArreglo)    
            };
            res.send(filtroDevuelto)
            
})
module.exports = router;


    


