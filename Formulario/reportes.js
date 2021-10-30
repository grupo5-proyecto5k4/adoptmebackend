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


router.get('/animales/provisorio', auth,  async function(req,res, next ){
    let userAux = req.user.user
   
      
    var desde = formato(req.query.fechaDesde)
    var hasta = formato(req.query.fechaHasta)
   
    // contador de Perros 
      var perrosCaAdopPorSuProvisorio = 0,  perrosAdAdopPorSuProvisorio = 0
      var perrosCaAdopPorOtro = 0 , perrosAdAdopPorOtro = 0 
      
    // Contadores de Gatos 
      var gatosCaAdopPorSuProvisorio = 0, gatosAdAdopPorSuProvisorio = 0
      var gatosCaAdopPorOtro = 0 , gatosAdAdopPorOtro = 0

    // contador total 
    var totalPerrosAdoptados = 0 , totalGatosAdoptados = 0    
    
   
    var Adoptados = await Adopcion.find({estadoId: estadoAprobado, responsableId: userAux._id ,  fechaCreacion: {$gte: desde, $lte: hasta}})
    
    var ciclos = 0 
    if (Adoptados.length != undefined) ciclos = Adoptados.length
    for(let i = 0 ; i < ciclos ; i ++)
    { 
       
      let esPerro = false , esCachorro = false
        

        let ani = await Animal.findOne({_id: Adoptados[i].mascotaId})  
        var diferencia= Math.abs(Date.now() - ani.fechaNacimiento)
        var edadDias = Math.round(diferencia/(1000*3600*24))
        
        if (edadDias < 366) esCachorro = true 

        if (ani.tipoMascota == 0) esPerro = true

        let provisorios = await Provisorio.find({
            mascotaId: Adoptados[i].mascotaId,
            responsableId: Adoptados[i].responsableId,
            solicitanteId: Adoptados[i].solicitanteId,
            estadoId: estadoAprobado
          })
        if(provisorios != undefined && esPerro) {
           if(esCachorro){
              perrosCaAdopPorSuProvisorio ++    
           }
          else{
            perrosAdAdopPorSuProvisorio ++
          } 
          continue
        }

        if(provisorios.length != undefined) {
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
            solicitanteId: {$ne : Adoptados[i].solicitanteId},
            estadoId: estadoAprobado
          })
       
       if(provisorios != undefined && esPerro) {
          if(esCachorro){
            perrosCaAdopPorOtro ++    
          }
          else{
            perrosAdAdopPorOtro ++
          } 
          continue
       }

       if(provisorios.length != undefined) {
        if(esCachorro){
          gatosCaAdopPorOtro ++    
        }
        else{
          gatosAdAdopPorOtro ++
        } 
       }
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


function formato(fecha){
  var fec = "" ,
  fec = fecha
  let anio = "" , mes = "" , dia = "", x = 0, y = fec.length
  while( x < y) {
    if(x < 4) anio =  anio + fec.charAt(x)
    if(x > 3 && x < 6) mes = mes + fec.charAt(x)
    if(x > 5) dia = dia + fec.charAt(x)
    x++
  }
 
  return new Date(Date.UTC(anio, mes - 1, dia, 0, 0, 0))
}



module.exports = router;