const bcrypt = require('bcrypt')
const mongosee = require('mongoose')
const express = require('express')
const Foto = require('../modelos/foto.js')
const jwt = require('jsonwebtoken')
const router = express.Router()
const {check, validationResult } = require('express-validator');
const { schema, eventNames } = require('../modelos/foto.js');
const cloudinary = require('cloudinary')
const fs = require('fs-extra')
const Adopcion = require('../Formulario/adopcion.js')
const auth = require('../middleware/auth.js')
const Animal = require('../modelos/animal.js')
const Provisorio = require('../Formulario/provisorio.js')
const User = require('../modelos/usuarios.js')
const histoEstadoAnimal= require('../modelos/histoEstadoAnimal.js')

/* estados Animal*/
const estadoAprobado = "Aprobado"
const estadoAdoptado    = "Adoptado"
const estadoEnProvisorio= "En Provisorio"
const estadoDisProvisorio= "Disponible Provisorio"
const estadoDispAdopcion= "Disponible Adopcion" 
const estAdopcionProvisorio = "Disponible Adopción y Provisorio" 
/*Estados de Solicitud */
const estadoInicial = 'Abierta'
const estadoAproResponsable = "Aprobado Por Responsable" 
const estadoSuspendido = "Suspendido"
const estadoSuspSolicitante="Suspendido por Solicitante"
const estadoBloqueado = "Bloqueado"


router.get('/cantidadAnimalesProvisorio', auth, async function(req, res){
    let userAux = req.user.user
    if (userAux.tipoUsuario != 2 ) return res.status(401).json({error: 'No tiene permiso para realizar esta tarea'})

    let animalesAdoptados = await Animal({responsableId: userAux._id, estadoId: estadoAprobado})
    
    for(let i; i < animalesAdoptados.length; i ++){
          

    }
    

})

async function buscarProvisorio(animal){
    let historico = await histoEstadoAnimal.find({mascotaId: animal_id, estadoId: estadoEnProvisorio })
    if (historico.length != 0) return 
    historico.forEach(async element => {
        let solicitud = await Adopcion.find({mascotaId: animal._id})
        
    }); 

}