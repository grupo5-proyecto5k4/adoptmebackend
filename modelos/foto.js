const jwt = require('jsonwebtoken')
const mongosee = require('mongoose');

const fotoSchema = new mongosee.Schema({
    titulo: {type: String},
    descripcion: {type: String},
    imagenURL: {type: String}
});

fotoSchema.methods.generateJWT = function(){
    return jwt.sign({
        _id: this._id,
        id_foto: this.id_foto,
        titulo: this.titulo,
        fechaCreacion: this.fechaCreacion,
        fechaModificacion: this.fechaModificacion
    }, process.env.SECRET_KEY_JWT)
}
const Foto = mongosee.model('am-foto', fotoSchema);
module.exports = Foto
