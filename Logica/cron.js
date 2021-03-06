const cron = require('node-cron');
const Adopcion = require('../Formulario/adopcion.js')
const Animal = require('../modelos/animal.js')
const Provisorio = require('../Formulario/provisorio.js')
const Seguimiento = require('../modelos/seguimiento.js')
const Notificacion = require('../modelos/notificacion.js')
const ahora = require('../fecha.js');
const { now } = require('mongoose');
const estadoAprobado = "Aprobado"

 cron.schedule('0 0 6 * * *', function(){
    buscarSeguimientosANotificar();
       buscarFinProvisorioANotificar()
 })

async function buscarSeguimientosANotificar() {
    const fecha_seguimiento_buscada = new Date();
    fecha_seguimiento_buscada.setDate(fecha_seguimiento_buscada.getDate() + 1);
    const milisegundosFechaBuscada = fecha_seguimiento_buscada.valueOf();

    const seguimientos = await Seguimiento.find({ estadoId: "Iniciado" });
    console.log(seguimientos)

    const seguimientosFiltrados = seguimientos.filter(s => {
        const seguimientoMilisegundos = s.fechaCreacion.valueOf();

        const dias = Math.round(Math.abs((milisegundosFechaBuscada - seguimientoMilisegundos)) / 86400000);
        return dias % s.cadaCuanto == 0
    });

    console.log(seguimientosFiltrados)
    for (i = 0; i < seguimientosFiltrados.length; i++) {

        let solicitudAdopcion = await Adopcion.findById({ _id: seguimientosFiltrados[i].SolicitudId })
        if (!solicitudAdopcion) {
            solicitudAdopcion = await Provisorio.findById({ _id: seguimientosFiltrados[i].SolicitudId })
        }

        let animal = await Animal.findById({ _id: solicitudAdopcion.mascotaId })

        let fecha = await formatearFecha(fecha_seguimiento_buscada)
        //Llamar a la función que notifique
        notificar('Próximo seguimiento a realizar', animal.nombreMascota+' tiene un seguimiento agendado para el día ' + fecha, 'Mascota', animal._id, animal.responsableId)
    }
}

async function formatearFecha(entrada) {
    var fecha = entrada.toISOString()
    var date = (fecha.split("T", 1)).toString();
    var [yyyy, mm, dd] = date.split("-");
    var revdate = `${dd}/${mm}/${yyyy}`;
    return revdate;
}

async function formatearFechaProvisorio(entrada) {
    
    var date1 = new Date(entrada).toISOString()
    var [date, date2] = date1.split('T')
    console.log(date)
    var [yyyy, mm, dd] = date.split("-");
    var revdate = `${dd}/${mm}/${yyyy}`;
    return revdate;
}

async function notificar(titulo, texto, objetoAMostrar, objetoId, remitente){

    let notificacion = new Notificacion({
        nombreNotificacion: titulo,
        descripcion: texto,
        remitenteId: remitente,
        objetoAMostrar: objetoAMostrar,
        objetoAMostrarId: objetoId,
        fechaCreacion: ahora.ahora(),
 })
    
 await notificacion.save()
}


async function buscarFinProvisorioANotificar() {
    var dia = ahora.sumar(48)
    let fecha = await formatearFechaProvisorio(dia)
    let solicitudProvisorio = await Provisorio.find({fechaFinProvisorio :  {$gte: ahora.ahora() , $lte: dia}, estadoId: estadoAprobado })
    var desde = solicitudProvisorio.length
 
    for (let i = 0;i < desde ; i++) {
         
       let animal = await Animal.findById({_id: solicitudProvisorio[i].mascotaId}) 
       notificar('Finalizacion de Provisorio', 'El provisorio de la Mascota ' + animal.nombreMascota + ' concluira el día ' + fecha, 'Mascota', animal._id, solicitudProvisorio[i].solicitanteId)
    }

}
