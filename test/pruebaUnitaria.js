'usr stricts'
let chai = require('chai'); 
const expect = require('chai').expect

const url='mongodb://localhost:27017/BD_ADOPTME';

describe('Ingresar un usuario', ()=>{
      it('insertar un user', (done)=> {
          chai.request(url)
          .post('/am_usuarios')
          .send({_id:0, nombres: "Evangelina",
            apellidos: 'Pereyra',
            dni:'32282532',
            fechaNacimiento:15/01/1981,
            instagram:'instagram',
            facebook:'faceook',
            correoElectronico: 'evanpereyra@gmail.com',
            password: hashPassword,
            esParticular: true,
            esRescatista: false
        });

      }); 

});

