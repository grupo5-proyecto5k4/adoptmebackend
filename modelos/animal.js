const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')
const mongosee = require('mongoose')
//const {Schema, model} = require("mongoose")

/* agregar un campo de esVisible*/
const animalSchema  = new mongosee.Schema({
  tipoMascota: {type: Number},
  nombreMascota: {type: String},
  fechaAlta: {type: Date, default: Date.now},
  fechaModificacion:{type: Date, default: Date.now},
  tamañoFinal: {type: String},
  fechaNacimiento: {type: Date, default: Date.now},
  sexo: {type: String},
  raza: {type: String},
  estado: {type: String},
  responsableCategoria: {type: Number},
  responsableId: {type: ObjectId},
  castrado: {type: String},
  conductaNiños: {type: String},
  conductaPerros: {type: String},
  conductaGatos: {type: String},
  descripcion: {type: String},
  Foto:[{ foto: String,
          esPrincipal: Boolean 
         }
     ],
});
/* Tipo mascota: 0- perro, 1- Gato
  Tamaño final: Pequeño, Mediano, Grande, gato = null
  esCachorro: 0 (F)-Cachorro, 1(V)-Adulto
  Sexo: Macho, Hembra
  Conducta: Mala, regular, buena, excelente
  Castrado: 0 (si), 1 (no)
  */
  animalSchema.methods.generateJWT = function(){
    return jwt.sign({
        _id: this._id,
        idAnimal: this.idAnimal,
        tipoMascota: this.tipoMascota,
        nombreMascota: this.nombreMascota,
        fechaAlta: this.fechaAlta,
        fechaModificacion: this.fechaModificacion,
        tamañoFinal: this.tamañoFinal,
        fechaNacimiento: this.fechaNacimiento,
        sexo: this.sexo,
        raza: this.raza,
        estado: this.estado,
        responsableCategoria: this.responsableCategoria,
        responsableId: this.responsableId,
        castrado: this.castrado,
        condutaNiños: this.conductaNiños,
        condutaPerros: this.conductaPerros,
        condutaGatos: this.conductaGatos,
        descripcion: this.descripcion

        
    }, process.env.SECRET_KEY_JWT)
}
// var usuarioFiltradoSchema = mongosee.Schema({
//       usuarioFiltrado: {type: mongosee.Schema.Types.ObjectId, ref: 'usuarioFiltrado'},
//       barrio: String,
//       nombres: String,
// });

// var usuarioFiltrado = mongosee.model('usuarioFiltrado', usuarioFiltradoSchema);    
// const Animal = mongosee.model('am-animal', animalSchema);
// module.exports = Animal
// module.exports = usuarioFiltrado

const Animal = mongosee.model('am-animal', animalSchema);
module.exports = Animal
  