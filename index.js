const mongoose = require('mongoose');
const express = require('express');
//const PORT = process.env.PORT || '8080'

const app = express();
const user = require('./Logica/usuarios.js')
const estados = require('./Logica/estados.js')
const animal = require('./Logica/animal.js')

app.use(express.json())
app.use('/', user, estados)
app.use('/estados/', estados)
app.use('/animal/', animal)

const port = process.env.PORT || 3003

app.listen(port, ()=> console.log('Escuchando Puerto: ' + port))


if( process.env.NODE_ENV !=  'production'){
    const dotenv = require('dotenv');
    dotenv.config();
}


mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URL,
 {useCreateIndex: true, useUnifiedTopology: true, useNewUrlParser: true})
   .then(()=> console.log('Conectado correctamente a MongoDB'))
   .catch(()=> console.log('Error al conectarse a MongoDB'));
