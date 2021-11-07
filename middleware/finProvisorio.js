const jwt = require('jsonwebtoken')
const Adopcion = require('../Formulario/adopcion.js')
const auth = require('../middleware/auth.js')
const Animal = require('../modelos/animal.js')
const Provisorio = require('../Formulario/provisorio.js')
const User = require('../modelos/usuarios.js')
const histoEstadoAnimal= require('../modelos/histoEstadoAnimal.js')
const cron = require('node-cron')
const ahora = require('../fecha.js')


const estadoInicial = 'Abierta'
const estadoAproResponsable = "Aprobado Por Responsable" 
const estadoSuspendido = "Suspendido"
const estadoSuspSolicitante="Suspendido por Solicitante"
const estadoBloqueado = "Bloqueado"
const estadoAprobado = "Aprobado"
const estadoFinalizado = "Finalizado"


/* estados Animal*/
const estadoAdoptado    = "Adoptado"
const estadoEnProvisorio= "En provisorio"
const estadoDisProvisorio= "Disponible Provisorio"
const estadoDispAdopcion= "Disponible Adopción" 
const estAdopcionProvisorio = "Disponible Adopción y Provisorio"



cron.schedule('*/1 * * * *', async function(){
    var f = new Date(ahora.ahora).toISOString() 
    console.log (f)
    var f1 = f.split('T')
    var fecha = new Date (f1[0]) 
    var solicitudes = await Provisorio.find({estadoId: estadoAprobado, fechaFinProvisorio:{$gte: fecha}})
   
    let desde = solicitudes.length  
    if (solicitudes.length == undefined){
        desde = 0 
        let estadoAnterior = await histoEstadoAnimal.find({mascotaId:solicitudes.mascotaId, estadoId:{ $nin: estadoEnProvisorio}}).sort({fechaCreacion: -1})
        let estAnt = estadoAnterior[0].estadoId
        if(estadoAnterior.length == undefined) estAnt = estadoAnterior.estadoId 

        let animal = await Animal.findByIdAndUpdate(solicitudes.mascotaId,{
           estado: estAnt, 
           fechaModificacion : fecha 
        },
         {
          new: true
        })
         
        let historial = new histoEstadoAnimal({
            mascotaId : solicitudes.mascotaId,
            solicitud: solicitudes._id,
            estadoId : estadoEnProvisorio })
            await historial.save()
      
        
        let solicitud =  await Provisorio.findByIdAndUpdate(solicitudes._id, 
            {
                estadoId: estadoFinalizado, 
                fechaModificacion : fecha 
             },
             {
                 new: true
             }   
            
            )    

 }

    for (let i = 0 ; i < desde ; i ++ ){
        let estadoAnterior = await histoEstadoAnimal.find({mascotaId:solicitudes[i].mascotaId, estadoId:{ $nin: estadoEnProvisorio}}).sort({fechaCreacion: -1})
        let estAnt = estadoAnterior[0].estadoId
        if(estadoAnterior.length == undefined) estAnt = estadoAnterior[0].estadoId 

        let animal = await Animal.findByIdAndUpdate(solicitudes[i].mascotaId,{
           estado: estAnt, 
           fechaModificacion : fecha 
        },
         {
          new: true
        })
         
        let historial = new histoEstadoAnimal({
            mascotaId : solicitudes[i].mascotaId,
            solicitud: solicitudes[i]._id,
            estadoId : estadoEnProvisorio })
            await historial.save()
      
        
        let solicitud =  await Provisorio.findByIdAndUpdate(solicitudes[i]._id, 
            {
                estadoId: estadoFinalizado, 
                fechaModificacion : fecha 
             },
             {
                 new: true
             }   
            
            )    

     
    }
})


module.exports = cron