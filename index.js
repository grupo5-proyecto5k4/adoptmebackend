const mongoose = require('mongoose')
const express = require('express')
const app = express()
const user = require('./Logica/usuarios.js')
app.use(express.json())
app.use('/api/usuario/', user)
//app.use('/api/user/', user)
//app.use('/api/company/', company)
//app.use('/api/sale/', sale)
//app.use('/api/auth/', auth)
const port = process.env.PORT || 3003
app.listen(port, ()=> console.log('Escuchando Puerto: ' + port))

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/BD_ADOPTME', {useCreateIndex: true, useUnifiedTopology: true, useNewUrlParser: true})
    .then(()=> console.log('Conectado correctamente a MongoDB'))
    .catch(()=> console.log('Error al conectarse a MongoDB'));

    
 //.connect (process.env.MONGO_URI, {useUnifiedTopology: true, useNewUrlParser: true,}).
//then (() => console.log ('DB Connected!'))
//.catch (err => {
//console.log ( DB Connection Error: ${err.message});
//});   'mongodb://localhost:27017/BD_ADOPTME'