const jwt = require('jsonwebtoken')

function auth(req, res, next){
    console.log ('token ',  req)
    const jwtToken = req.header('auth-token')
    console.log ("token ", jwtToken)
    if(!jwtToken) return res.status(401).send('Acceso Denegado. Necesitamos un token valido')
  
    try{
        const payload = jwt.verify(jwtToken, process.env.SECRET_KEY_JWT)
        
        req.user = payload
        
        next()
    }catch(e){
        res.status(400).send('Acceso Denegado. Token no valido')
    }
}

module.exports = auth