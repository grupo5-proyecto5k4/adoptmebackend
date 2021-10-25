const bcrypt = require('bcrypt')
const mongosee = require('mongoose')
const express = require('express')
const Animal = require('../modelos/animal.js')
const jwt = require('jsonwebtoken')
const router = express.Router()
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth.js')
const { ObjectId } = require('mongodb');
const Foto = require('../modelos/foto.js')
const cloudinary = require('cloudinary');
const fs = require('fs-extra');
const Estados = require('../modelos/estados.js')
const { schema } = require('../modelos/estados.js')
const Vacuna = require('../modelos/vacuna.js')
const Usuario = require('../modelos/usuarios.js')

cloudinary.config({
    cloud_name: process.env.cloudname,
    api_key: process.env.apikey,
    api_secret: process.env.apisecret
})


//Buscar un animal por un determinado id
router.get('/buscar', async function (req, res) {
    console.log('llega')

    const animal = await Animal.find()
    console.log(animal)
    res.send(animal)
})

router.post('/animal', auth, async function (req, res) {
    let userAux = req.user.user
    let castrado = true
    if (req.body.castrado == 2) castrado = false
    let estado = " "
    switch (req.body.estado) {
        case 7:
            estado = "Disponible Adopción";
            break;
        case 8:
            estado = "Disponible Adopción y Provisorio";
            break;
        case 9:
            estado = "Disponible Provisorio";
            break;
        default:
            estado = "Disponible Adopción y Provisorio";
    }


    let animal = new Animal({
        tipoMascota: req.body.tipoMascota,
        nombreMascota: req.body.nombreMascota,
        fechaAlta: req.body.fechaAlta,
        fechaModificacion: req.body.fechaModificacion,
        tamañoFinal: req.body.tamañoFinal,
        fechaNacimiento: req.body.fechaNacimiento,
        sexo: req.body.sexo,
        raza: req.body.raza,
        estado: estado,
        responsableCategoria: req.body.responsableCategoria,
        responsableId: userAux._id,
        castrado: req.body.castrado,
        conductaNiños: req.body.conductaNiños,
        conductaPerros: req.body.conductaPerros,
        conductaGatos: req.body.conductaGatos,
        descripcion: req.body.descripcion,
        foto: req.body.foto
    })

    const result = await animal.save()

    const jwtToken = result.generateJWT()

    console.log(result)

    res.status(201).json({ id_Animal: result._id })
});

// filtrar mascotas segun su estado
router.get('/animal/:estados', async (req, res) => {
    let nueva = req.params.estados.replace(/_/g, " ")
    let animal = await Animal.find({ estado: nueva })
    res.send(animal)
});

// filtrar mascotas segun su estado y segun el id del responsable
router.get('/respestados/:responestados', auth, async (req, res) => {
    let nueva = req.params.responestados.replace(/_/g, " ")
    let userAux = req.user.user
    let animal = await Animal.find({ responsableId: userAux._id, estado: nueva })

    if (animal.length == 0) return res.status(200).json({ mesage: '[]' })
    res.send(animal)
});

//Traer todas las mascotas que cumplen con los filtros, en gral, no responden a un det usuario
router.get('/filtrosMascota/filtroAnimalSinResp', auth, async (req, res) => {
    const filter = {}
    const { estado, sexo, tamañoFinal, tipoMascota } = req.query;
    
    if (estado) filter.estado = estado;
    if (sexo) filter.sexo = sexo;
    if (tamañoFinal) filter.tamañoFinal = tamañoFinal;
    if (tipoMascota) filter.tipoMascota = Number(tipoMascota);
    let animalDevuelto = await Animal.find(filter)
    res.send(animalDevuelto)
});

//Filtrar las mascotas por los filtros del item anterior y ademas filtrar en funcion
//de los datos del centro recatista (barrio del centro y nombre del centro)
router.get('/filtrosMascota/filtroAnimalCentroResc', async (req, res) => {
    const filter2 = {}
    let filtroDevuelto = []
    const { estado, sexo, tamañoFinal, tipoMascota } = req.query;

    if (estado) filter2.estado = estado;
    if (sexo) filter2.sexo = sexo;
    if (tamañoFinal) filter2.tamañoFinal = tamañoFinal;
    if (tipoMascota) filter2.tipoMascota = Number(tipoMascota);
    console.log(filter2);
    let animalDevuelto = await Animal.find(filter2)
    console.log(animalDevuelto)
    for (let i = 0; i < animalDevuelto.length; i++) {
        const filter4 = {}

        filter4._id = animalDevuelto[i].responsableId
        let usuarioDevueltoNew = await Usuario.findById(filter4)

        if (!usuarioDevueltoNew) continue
        if (usuarioDevueltoNew.nombres != req.query.nombres && req.query.nombres) continue
        if (usuarioDevueltoNew.Direccion.barrio != req.query.barrio && req.query.barrio) continue
        var nuevoArreglo = {
            Animal: animalDevuelto[i],
        }
        filtroDevuelto.push(nuevoArreglo.Animal)
    };
    res.send(filtroDevuelto)
});

//Filtros de mascota segun el id de un determinado usuario

router.get('/filtrosMascota/filtroAnimal', auth, async (req, res) => {
    const filter = {}
    //let userAux = req.user.user
    const { estado, sexo, tamañoFinal, tipoMascota, responsableId } = req.query;

    if (estado) filter.estado = estado;
    if (sexo) filter.sexo = sexo;
    if (tamañoFinal) filter.tamañoFinal = tamañoFinal;
    if (tipoMascota) filter.tipoMascota = Number(tipoMascota);
    if (responsableId) filter.responsableId = responsableId;

    let animalDevuelto = await Animal.find(filter)
    res.send(animalDevuelto)
});

//---------------------------------------------------------------------------------------------------
//Reporte de estadísticas de cuanto tiempo pasa un animal desde que se le da de alta en la aplicación
// hasta que es finalmente adoptado, EL ESTADO DEL ANIMAL TIENE QUE SER ADOPTADO

router.get('/reportes/reporteTiempoAdopcion', auth, async (req, res) => {
    let userAux = req.user.user
    if(userAux.tipoUsuario != 2)return res.status(402).json({Error: "No tiene permisos suficientes para esta acción"})
    let perrosFiltradosAdulto = []
    let perrosFiltradosCachorro = []
    let gatosFiltradosAdulto = []
    let gatosFiltradosCachorro = []
    let acumuladorRestaPerroAdulto = 0
    let acumuladorRestaPerroCachorro = 0
    let acumuladorRestaGatoAdulto = 0
    let acumuladorRestaGatoCachorro = 0
    let promedioPerroAdulto = 0
    let promedioPerroCachorro = 0
    let promedioGatoAdulto = 0
    let promedioGatoCachorro = 0
    //let animalesAdoptados = await Animal.find({estado : "Adoptado", ResponsableId : userAux._id})
    let animalesAdoptados = await Animal.find({estado : "Adoptado"})
    var countGatoAdulto = 0
    var countGatoCachorro  = 0
    var countPerroAdulto = 0
    var countPerroCachorro = 0
    
    for (let i = 0; i < animalesAdoptados.length; i++) {
        var diferencia= Math.abs(Date.now() - animalesAdoptados[i].fechaNacimiento)
        var edadDias = Math.round(diferencia/(1000*3600*24))
        var fechaAlta = animalesAdoptados[i].fechaAlta
        var fechaModificacion = animalesAdoptados[i].fechaModificacion
        var resta = fechaModificacion - fechaAlta
        if(animalesAdoptados[i].tipoMascota == 0) //perro
        {
            if(edadDias > 365) //adulto
                {
                    acumuladorRestaPerroAdulto += resta
                    countPerroAdulto ++
                    perrosFiltradosAdulto.push(resta)
                }
                else
                { 
                    acumuladorRestaPerroCachorro += resta 
                    countPerroCachorro ++
                    perrosFiltradosCachorro.push(resta)
                }

            }
            else{ //gato

                if(edadDias > 365) //adulto
                {
                    acumuladorRestaGatoAdulto += resta
                    countGatoAdulto ++
                    gatosFiltradosAdulto.push(resta)
                }
                else
                { 
                    acumuladorRestaGatoCachorro += resta 
                    countGatoCachorro ++
                    gatosFiltradosCachorro.push(resta)
                }

            }
        }

       
    let valorMaximoPerroAdulto = estaVacio(Math.max.apply(0, perrosFiltradosAdulto))
    let valorMaximoPerroCachorro = estaVacio(Math.max.apply(0, perrosFiltradosCachorro))
    let ValorMinimoPerroAdulto = estaVacio(Math.min.apply(0, perrosFiltradosAdulto))
    let ValorMinimoPerroCachorro = estaVacio(Math.min.apply(0, perrosFiltradosCachorro))
    let valorMaximoGatoAdulto = estaVacio(Math.max.apply(0, gatosFiltradosAdulto))
    let valorMaximoGatoCachorro = estaVacio(Math.max.apply(0, gatosFiltradosCachorro))
    let valorMinimoGatoAdulto = estaVacio(Math.min.apply(0, gatosFiltradosAdulto))
    let valorMinimoGatoCachorro = estaVacio(Math.min.apply(0, gatosFiltradosCachorro))
    
    if(countPerroAdulto != 0) promedioPerroAdulto = acumuladorRestaPerroAdulto/countPerroAdulto
    if(countPerroCachorro != 0) promedioPerroCachorro = acumuladorRestaPerroAdulto/countPerroCachorro
    if(countGatoAdulto != 0) promedioGatoAdulto = acumuladorRestaGatoAdulto/countGatoAdulto
    if(countGatoCachorro != 0) promedioGatoCachorro = acumuladorRestaGatoCachorro/countGatoCachorro
    
    var reporteFinal =  [
            {
            "categoria":"perroCachorro",
            "minimo": conversionDias(ValorMinimoPerroCachorro),
            "promedio": conversionDias(promedioPerroCachorro),
            "maximo": conversionDias(valorMaximoPerroCachorro)
            },
            {
            "categoria":"perroAdulto",
            "minimo": conversionDias(ValorMinimoPerroAdulto),
            "promedio": conversionDias(promedioPerroAdulto),
            "maximo": conversionDias(valorMaximoPerroAdulto)
            },
            {
            "categoria":"gatoCachorro",
            "minimo": conversionDias(valorMinimoGatoCachorro),
            "promedio": conversionDias(promedioGatoCachorro),
            "maximo": conversionDias(valorMaximoGatoCachorro)
            },
            {
            "categoria":"gatoAdulto",
            "minimo": conversionDias(valorMinimoGatoAdulto),
            "promedio": conversionDias(promedioGatoAdulto),
            "maximo": conversionDias(valorMaximoGatoAdulto)
            }
        ]
        res.send(reporteFinal) 
})

function conversionDias (mili)
{
    var edadDias = Math.round(mili/(1000*3600*24))
    return parseInt(edadDias, 10)
}

function estaVacio (variable)
{
    if(variable == null) return 0
    return variable

}



module.exports = router;





