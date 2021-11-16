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
const ahora = require('../fecha.js')

/* estados Animal*/
const estadoAprobado = "Aprobado"
const estadoAdoptado    = "Adoptado"
const estadoEnProvisorio= "En Provisorio"
const estadoDisProvisorio= "Disponible Provisorio"
const estadoDispAdopcion= "Disponible Adopción" 
const estAdopcionProvisorio = "Disponible Adopción y Provisorio" 

/*Estados de Solicitud */
const estadoInicial = 'Abierta'
const estadoAproResponsable = "Aprobado Por Responsable" 
const estadoSuspendido = "Suspendido"
const estadoSuspSolicitante="Suspendido por Solicitante"
const estadoBloqueado = "Bloqueado"
const estadoFinalizado = "Finalizado"

router.get('/animales/provisorio', auth,  async function(req, res, next ){
    let userAux = req.user.user
   
      
    var desde = formato(req.query.fechaDesde, 0, 0, 0)
    var hasta = formato(req.query.fechaHasta, 23, 59, 59)
   
    // contador de Perros 
      var perrosCaAdopPorSuProvisorio = 0,  perrosAdAdopPorSuProvisorio = 0
      var perrosCaAdopPorOtro = 0 , perrosAdAdopPorOtro = 0 
      
    // Contadores de Gatos 
      var gatosCaAdopPorSuProvisorio = 0, gatosAdAdopPorSuProvisorio = 0
      var gatosCaAdopPorOtro = 0 , gatosAdAdopPorOtro = 0

    // contador total 
    var totalPerrosAdoptados = 0 , totalGatosAdoptados = 0    
    
   
  var Adoptados = await Adopcion.find({estadoId: estadoAprobado, responsableId: userAux._id ,  fechaModificacion: {$gte: desde, $lte: hasta}})

    
    var ciclos = 0 
    if (Adoptados.length != undefined) ciclos = Adoptados.length
    for(let i = 0 ; i < ciclos ; i ++)
    { 
       
      let esPerro = false , esCachorro = false
                 

        let ani = await Animal.findById({_id: Adoptados[i].mascotaId})  
        var diferencia= Math.abs(Date.now() - new Date(ani.fechaNacimiento))
        var edadDias = Math.round(diferencia/(1000*3600*24))
        let provisorios = await Provisorio.find({mascotaId: Adoptados[i].mascotaId}) 
        console.log("longitud", provisorios.length)
        if(provisorios.length != 0) continue 

        console.log("Dias edad", edadDias)
        
        if (edadDias < 366) esCachorro = true 

        if (ani.tipoMascota == 0) esPerro = true

        provisorios = await Provisorio.find({
            mascotaId: Adoptados[i].mascotaId,
            responsableId: Adoptados[i].responsableId,
            solicitanteId: Adoptados[i].solicitanteId,
            
          })
        console.log("es solicitante", provisorios.length)

        if(provisorios.length != (undefined || null || 0) && esPerro) {
           if(esCachorro){
              perrosCaAdopPorSuProvisorio ++    
           }
          else{
            perrosAdAdopPorSuProvisorio ++
          } 
          continue
        }

        if(provisorios.length != (undefined || null || 0) ) {
          if(esCachorro){
            gatosCaAdopPorSuProvisorio ++    
          }
          else{
            gatosAdAdopPorSuProvisorio ++
           } 
          continue
          
        }    
       provisorios = await Provisorio.find({
            mascotaId: Adoptados[i].mascotaId,
            responsableId: Adoptados[i].responsableId,
            solicitanteId: {$ne : Adoptados[i].solicitanteId}         
          })
       console.log("no es solicitante", provisorios)
       if(provisorios.length != (undefined || null || 0) && esPerro) {
          if(esCachorro){
            perrosCaAdopPorOtro ++    
          }
          else{
            perrosAdAdopPorOtro ++
          } 
          continue
       }

       if(provisorios.length != (undefined || null || 0)) {
        if(esCachorro){
          gatosCaAdopPorOtro ++    
        }
        else{
          gatosAdAdopPorOtro ++
        } 
       }
       console.log()
    }
    totalPerrosAdoptados = perrosCaAdopPorSuProvisorio + perrosAdAdopPorSuProvisorio + perrosCaAdopPorOtro + perrosAdAdopPorOtro
    totalGatosAdoptados = gatosCaAdopPorSuProvisorio + gatosAdAdopPorSuProvisorio + gatosCaAdopPorOtro + gatosAdAdopPorOtro
   
    let arreglo = [{
      tipoMascota:"0",
      perrosCachorrosAdoptadosPorSuProvisorio: perrosCaAdopPorSuProvisorio,
      perrosAdultosAdoptadosPorSuProvisorio:perrosAdAdopPorSuProvisorio,
      perrosCachorrosAdoptadosPorOtro:perrosCaAdopPorOtro,
      perrosAdultosAdoptadosPorOtro:perrosAdAdopPorOtro,
      totalPerrosAdoptados:totalPerrosAdoptados
      },
      {
        tipoMascota:"1",
        gatosCachorrosAdoptadosPorSuProvisorio:gatosCaAdopPorSuProvisorio,
        gatosAdultosAdoptadosPorSuProvisorio:gatosAdAdopPorSuProvisorio,
        gatosCachorrosAdoptadosPorOtro:gatosCaAdopPorOtro,
        gatosAdultosAdoptadosPorOtro:gatosAdAdopPorOtro,
        totalGatosAdoptados:totalGatosAdoptados
      }
    ]
    res.send(arreglo)
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



router.get('/tiempoTotalMaxPromedio', auth,  async function(req, res, next ){
  let userAux = req.user.user
  if(userAux.tipoUsuario != 0 ) return res.status(401).json({error : "no tiene permiso para esta accion" })
  
  var desde = formato(req.query.fechaDesde, 0 , 0 , 0 )
  var hasta = formato(req.query.fechaHasta, 23, 59, 59)
  


  var promedioAdopcion = 0.0, promedioProvisorio = 0.0
  var tiempoTotalAdopcion = 0 ,  maximoTiempoAdopcion = 0 , minimoTiempoAdopcion = 0
  var tiempoTotalProvisorio = 0 ,  maximoTiempoProvisorio = 0 , minimoTiempoProvisorio = 0
  let totalSolicitudAdopcion = 0, totalSolicitudProvisorio
  
  var solicitudAdopcion = await Adopcion.find({estadoId: estadoAprobado, fechaModificacion: {$gte: desde, $lte: hasta}})

  totalSolicitudAdopcion = solicitudAdopcion.length
   
   for (let i = 0 ; i < solicitudAdopcion.length ; i ++ ){ 
    var diferencia= ahora.redMin(Math.abs(solicitudAdopcion[i].fechaModificacion - solicitudAdopcion[i].fechaCreacion))
    var edadDias = Math.round(diferencia/(1000*3600*24))
    tiempoTotalAdopcion += edadDias
    if (maximoTiempoAdopcion < edadDias) maximoTiempoAdopcion = edadDias
    if (minimoTiempoAdopcion > edadDias || minimoTiempoAdopcion == 0) minimoTiempoAdopcion =  edadDias

   }
   if(totalSolicitudAdopcion !=0 )promedioAdopcion =  tiempoTotalAdopcion / totalSolicitudAdopcion

   // Provisorio
   var solicitudProvisorio = await Provisorio.find({estadoId: estadoAprobado, fechaModificacion: {$gte: desde, $lte: hasta}})

   totalSolicitudProvisorio = solicitudProvisorio.length
   
   for (let i = 0 ; i < solicitudProvisorio.length ; i ++ ){ 
    var diferencia= ahora.redMin(Math.abs(solicitudProvisorio[i].fechaModificacion - solicitudProvisorio[i].fechaCreacion))
    var edadDias = Math.round(diferencia/(1000*3600*24))
    
    tiempoTotalProvisorio += edadDias
    if (maximoTiempoProvisorio < edadDias) maximoTiempoProvisorio = edadDias
    if (minimoTiempoProvisorio > edadDias || minimoTiempoProvisorio == 0) minimoTiempoProvisorio =  edadDias

   }

  if(totalSolicitudProvisorio != 0) promedioProvisorio = tiempoTotalProvisorio / totalSolicitudProvisorio

   Arreglo = [{
     MaximoTiempoAdopcion   : maximoTiempoAdopcion ,
     PromedioTiempoAdopcion : Math.round(promedioAdopcion) ,
     MinimoTiempoAdopcion   : minimoTiempoAdopcion,
     cantidadTotalAdopcion  : totalSolicitudAdopcion

   },
   {
    maximoTiempoProvisorio   : maximoTiempoProvisorio ,
    PromedioTiempoProvisorio : Math.round(promedioProvisorio) ,
    MinimoTiempoProvisorio   : minimoTiempoProvisorio,
    cantidadTotalProvisorio  : totalSolicitudProvisorio
  }

  ]
   res.send(Arreglo)
})





module.exports = router;