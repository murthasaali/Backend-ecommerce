const jwt = require('jsonwebtoken')

module.exports = function verifyToken (req,res, next) {
    const token = req.headers["authorization"].replace("Ba")
    console.log("token",token)
    if(!token){
        return res.status(403).send({error:"No token Provided 🙆🏻‍♂️"})
    }
    jwt.verify(token, process.env.JWT_SECRET,(err, decode) => {
        if(err) {
            return res.status(401).json({error: "Unathorazed😠"})
        }
        console.log(decode)
        console.log(req.email)
        req.email = decode.email
        next()
    })

}