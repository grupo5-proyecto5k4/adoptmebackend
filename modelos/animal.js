const jwt = require('jsonwebtoken')
const mongosee = require('mongoose')

const animalSchema  = new mongosee.Schema({
  tipoMascota: {type: Number},
  nombreMascota: {
    type: String,
    required: true,
    unique: true
  },
  fechaAlta: {type: Date, default: Date.now},
  fechaModificacion:{type: Date, default: Date.now},
  tamañoFinal: {type: String},
  esCachorro: {type: Boolean},
  edad: {type: Number},
  sexo: {type: Boolean},
  razaPadre: {type: String},
  razaMadre: {type: String},
  estado: {type: String},
  responsableCategoria: {type: Number},
  responsableId: {type: Number},
  castrado: {type: Boolean},
  condutaNiños: {type: String},
  condutaPerros: {type: String},
  condutaGatos: {type: String},
  descripcion: {type: String}
});
/* Tipo mascota: 0- perro, 1- Gato
  Tamaño final: Pequeño, Mediano, Grande, gato = null
  esCachorro: 0 (F)-Cachorro, 1(V)-Adulto
  Sexo: 0- Macho, 1- Hembra
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
        esCachorro: this.esCachorro,
        edad: this.edad,
        sexo: this.sexo,
        razaPadre: this.razaPadre,
        razaMadre: this.razaMadre,
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
const Animal = mongosee.model('am-animal', animalSchema);
module.exports = Animal
  