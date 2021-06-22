const mongoose = require('mongoose');
const express = require('express');
//const PORT = process.env.PORT || '8080'
const app = express();
const user = require('./Logica/usuarios.js')

console.log('Llego hasta aca')
//app.set("port", PORT);

app.use(express.json())
//app.use('/user', user)
app.use('/', user)
//app.use('/api/user/', user)
//app.use('/api/company/', company)
//app.use('/api/sale/', sale)
//app.use('/api/auth/', auth)
const port = process.env.PORT || 3003

app.listen(port, ()=> console.log('Escuchando Puerto: ' + port))



if( process.env.NODE_ENV !=  'production'){
    const dotenv = require('dotenv');
    dotenv.config();
}

console.log ('mongo :', process.env.MONGO_URL)
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URL,
 {useCreateIndex: true, useUnifiedTopology: true, useNewUrlParser: true})
   .then(()=> console.log('Conectado correctamente a MongoDB'))
   .catch(()=> console.log('Error al conectarse a MongoDB'));


/* const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://epereyra:pass1234@cluster0.hhsnz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
}); */