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
const Provisorio = require('../Formulario/provisorio.js')
const Adopcion = require('../Formulario/adopcion.js')
const ahora = require('../fecha.js')

//estado del animal y de la solicitud de provisorio
const estadoEnProvisorio= "En Provisorio"
const estadoAdoptado= "Adoptado"
const estadoInicial = 'Abierta'
const estadoAproResponsable = "Aprobado Por Responsable" 
const estadoSuspendido = "Suspendido"
const estadoSuspSolicitante="Suspendido por Solicitante"
const estadoBloqueado = "Bloqueado"
const estadoAprobado = "Aprobado"

//

cloudinary.config({
    cloud_name: process.env.cloudname,
    api_key: process.env.apikey,
    api_secret: process.env.apisecret
})


//Buscar un animal por un determinado id
router.get('/buscar/:id', async function (req, res) {
    const animal = await Animal.findById({_id : req.params.id})
    console.log(animal)
    res.send(animal)
})

router.post('/animal', auth, async function (req, res) {
    let userAux = req.user.user
    let esVisible = true 
    let animal = new Animal({
        tipoMascota: req.body.tipoMascota,
        nombreMascota: req.body.nombreMascota,
        fechaAlta: req.body.fechaAlta,
        fechaModificacion: req.body.fechaModificacion,
        tamañoFinal: req.body.tamañoFinal,
        fechaNacimiento: req.body.fechaNacimiento,
        sexo: req.body.sexo,
        raza: req.body.raza,
        estado: req.body.estado,
        responsableCategoria: req.body.responsableCategoria,
        responsableId: userAux._id,
        castrado: req.body.castrado,
        conductaNiños: req.body.conductaNiños,
        conductaPerros: req.body.conductaPerros,
        conductaGatos: req.body.conductaGatos,
        descripcion: req.body.descripcion,
        visible : esVisible,
        foto: req.body.foto
    })

    const result = await animal.save()

    const jwtToken = result.generateJWT()

    console.log(result)

    res.status(201).json({ id_Animal: result._id })
});

// filtrar mascotas segun su estado
// agregar que sea visible 
router.get('/animal/:estados', async (req, res) => {
    let nueva = req.params.estados.replace(/_/g, " ")
    let animal = await Animal.find({ estado: nueva, visible: true})
    res.send(animal)
});

// filtrar mascotas segun su estado y segun el id del responsable
router.get('/respestados/:responestados', auth,  async (req, res) => {
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
    //agregamos los visibles 
    filter2.visible = true

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
    var desde = formato(req.query.fechaDesde, 0, 0, 0)
    var hasta = formato(req.query.fechaHasta, 23, 59, 59)

    console.log(userAux)
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
    let animalesAdoptados = await Animal.find({estado : "Adoptado", responsableId : userAux._id, fechaModificacion: {$gte: desde, $lte: hasta}})
    var countGatoAdulto = 0
    var countGatoCachorro  = 0
    var countPerroAdulto = 0
    var countPerroCachorro = 0

    
    for (let i = 0; i < animalesAdoptados.length; i++) {
        var diferencia= Math.abs(ahora.ahora() - animalesAdoptados[i].fechaNacimiento)
         console.log(diferencia) 
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
        
    let valorMaximoPerroAdulto = Math.max.apply(0, estaVacio(perrosFiltradosAdulto))
    let valorMaximoPerroCachorro = Math.max.apply(0, estaVacio(perrosFiltradosCachorro))
    let ValorMinimoPerroAdulto = Math.min.apply(0, estaVacio(perrosFiltradosAdulto))
    let ValorMinimoPerroCachorro = Math.min.apply(0, estaVacio(perrosFiltradosCachorro))
    let valorMaximoGatoAdulto = Math.max.apply(0, estaVacio(gatosFiltradosAdulto))
    let valorMaximoGatoCachorro = Math.max.apply(0, estaVacio(gatosFiltradosCachorro))
    let valorMinimoGatoAdulto = Math.min.apply(0, estaVacio(gatosFiltradosAdulto))
    let valorMinimoGatoCachorro = Math.min.apply(0, estaVacio(gatosFiltradosCachorro))
    
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

function formato(fecha, h, m, s){
    var fec = "" ,
    fec = fecha
    let anio = "" , mes = "" , dia = "", x = 0, y = fec.length
    while( x < y) {
      if(x < 4) anio =  anio + fec.charAt(x)
      if(x > 3 && x < 6) mes = mes + fec.charAt(x)
      if(x > 5) dia = dia + fec.charAt(x)
      x++
    }
    
    return new Date(Date.UTC(anio, mes - 1, dia, h, m, s))
  }

function conversionDias (mili)
{
    var edadDias = Math.round(mili/(1000*3600*24))
    return parseInt(edadDias, 10)
}

function estaVacio (variable)
{
    var arreglo = [0]
    if(variable.length == 0) return arreglo
    return variable

}

//Modificar datos de la mascota(no en adopcion ni en provisorio), castrado y vacunas
router.put('/mascota/modificarMascota', auth, async function(req, res) {
    let userAux = req.user.user
    console.log("llega hasta aca")
    let animalNew = await Animal.findById({_id : req.body.id_Animal})
    let castradoNew = req.body.castrado
    let vacunasNew = req.body.nombreVacuna
    let fechaAplicacionNew = req.body.fechaAplicacion
    let conductaNiñosNew = req.body.conductaNiños
    let conductaPerrosNew = req.body.conductaPerros
    let conductaGatosNew = req.body.conductaGatos
    let descripcionNew = req.body.descripcion

    if(animalNew.castrado != castradoNew && castradoNew) {
        let resultado = await Animal.findByIdAndUpdate(animalNew._id,{castrado: castradoNew, fechaModificacion: ahora.ahora()}, {new: true})
    }
    if(animalNew.conductaNiños != conductaNiñosNew && conductaNiñosNew) {
        let resultado = await Animal.findByIdAndUpdate(animalNew._id,{conductaNiños: conductaNiñosNew, fechaModificacion: ahora.ahora()}, {new: true})
    }
    if(animalNew.conductaPerros != conductaPerrosNew && conductaPerrosNew) {
        let resultado = await Animal.findByIdAndUpdate(animalNew._id,{conductaPerros: conductaPerrosNew, fechaModificacion: ahora.ahora()}, {new: true})
    }
    if(animalNew.conductaGatos != conductaGatosNew && conductaGatosNew) {
        let resultado = await Animal.findByIdAndUpdate(animalNew._id,{conductaGatos: conductaGatosNew, fechaModificacion: ahora.ahora()}, {new: true})
    }
    if(animalNew.descripcion != descripcionNew && descripcionNew) {
        let resultado = await Animal.findByIdAndUpdate(animalNew._id,{descripcion: descripcionNew, fechaModificacion: ahora.ahora()}, {new: true})
    }
    if(vacunasNew && fechaAplicacionNew){
        let vacunaExistente = await Vacuna.find({nombreVacuna: vacunasNew, fechaAplicacion: fechaAplicacionNew})
        if(vacunaExistente.length == undefined){
            let vac = new Vacuna({
            nombreVacuna : element.nombreVacuna,
            fechaAplicacion: element.fechaAplicacion,
            id_Animal: element.id_Animal
        })
        const result = await vac.save()
    }
}
 animalNew = await Animal.findById({_id : req.body.id_Animal})
 res.send(animalNew)

})





//------------------------------------
//Modelos: Provisorio, Adopción
router.get('/encontrar/solicitudConfirmada', auth,  async function (req , res) {
   let userAux = req.user.user
   let barrioNew = req.query.barrio
   var modelo = req.query.modelo
   let solicitudProvisorio
   
    if(modelo.indexOf('Provisorio') == 0 )solicitudProvisorio = await Provisorio.find({solicitanteId : userAux._id, estadoId : estadoAprobado})
    if(modelo.indexOf('Adopcion') == 0 ) solicitudProvisorio = await Adopcion.find({solicitanteId :userAux._id, estadoId : estadoAprobado})
    
    if(userAux.tipoUsuario != 1)return res.status(404).json({error: "No tiene permisos"})
    const filter = {}
    const {sexo, tamañoFinal, tipoMascota} = req.query;
    if (sexo) filter.sexo = sexo;
    if (tamañoFinal) filter.tamañoFinal = tamañoFinal;
    if (tipoMascota) filter.tipoMascota = Number(tipoMascota);
   console.log("llego aca 1")
   
   filtrarProvisorio(solicitudProvisorio, filter, barrioNew, userAux).then(val => res.send(val))

})

/* Funcion para traer solicitudes*/ 

async function filtrarProvisorio(solicitudAdopciones, filter, barrioNew, usuario) {
    
    let animales = []  
    let desde = solicitudAdopciones.length
    if (solicitudAdopciones.length == undefined )
     {
      let filterProv = filter
      console.log(filterProv)
      filterProv._id = mongosee.Types.ObjectId(solicitudAdopciones.mascotaId)
      console.log(filterProv)
      desde = 0 
      let animal = await Animal.find(filterProv)
      if (!animal) return animales
      if (usuario.tipoUsuario != 1 && usuario.Direccion.barrio != barrioNew && barrioNew) return animales
      animales.push(animal)
    }
    
    for (let i = 0 ; i < desde ; i ++ ){
       
        let filterProv = filter
        filterProv._id = solicitudAdopciones[i].mascotaId
        let animal = await Animal.findById(filterProv)
        console.log("entro al for", animal)
        if (!animal) continue
        console.log("animales")
        if (usuario.tipoUsuario != 1 && usuario.Direccion.barrio != barrioNew && barrioNew) continue
        animales.push(animal)
        
    }
  return (animales)
  }
//Fin reporte solicitudes confirmadas de apoción

module.exports = router;




