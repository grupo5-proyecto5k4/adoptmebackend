const mongoose = require('mongoose');
const express = require('express');
const multer = require('multer');
const app = express();
const user = require('./Logica/usuarios.js')
const estados = require('./Logica/estados.js')
const animal = require('./Logica/animal.js')
const foto = require('./Logica/foto.js') //la constante que trabaja en la base de datos para consultas, etcs
const vacuna = require('./Logica/vacuna.js')
const recomendacion = require('./Logica/recomendacion.js')
const notificacion = require('./Logica/notificacion.js')
const adopcion  = require('./Formulario/adopcion-logica.js')
const seguimiento = require('./Logica/seguimiento.js')
const barrio = require('./Logica/barrio.js')
const reporte = require('./Formulario/reportes.js')
require('./Logica/cron.js')
require('./middleware/finProvisorio.js')
const ahora = require('./fecha.js')

console.log(ahora.ahora())


//app.use(multer({storage}.single('imagen'))) //tiene que tener el nombre imagen en el form del front
app.use(express.urlencoded({extended:  false}))
app.use(express.json())
app.use(multer({dest:'fotos_mascotas'}).array('imagen', 5));

app.use((req, res, next) => {

  // Dominio que tengan acceso (ej. 'http://example.com')
     res.setHeader("Access-Control-Allow-Origin", "*");
  
  // Metodos de solicitud que deseas permitir
     res.setHeader('Access-Control-Allow-Methods','POST, GET, OPTIONS, DELETE, PUT');
  
  // Encabecedados que permites (ej. 'X-Requested-With,content-type')
     res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,  auth-token");
  
  next();
  })

app.use('/', user, estados)
app.use('/estados/', estados)
app.use('/animales/', animal)
app.use('/fotos/', foto)
app.use('/vacunas/', vacuna )
app.use('/', recomendacion)
app.use('/', notificacion )
app.use('/formulario/', adopcion)
app.use('/seguimiento/', seguimiento)
app.use('/reporte/', reporte)
app.use('/barrios/', barrio)



const port = process.env.PORT || 3003

app.listen(port, ()=> console.log('Escuchando Puerto: ' + port))


if( process.env.NODE_ENV !=  'production'){
    const dotenv = require('dotenv');
    dotenv.config();
}



mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URL,
 {useCreateIndex: true, useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false})
   .then(()=> console.log('Conectado correctamente a MongoDB'))
   .catch(()=> console.log('Error al conectarse a MongoDB'));
