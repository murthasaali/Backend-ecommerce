const jwt = require('jsonwebtoken');

module.exports = function verifyToken(req, res, next) {
    const token = req.headers["authorization"].replace("Bearer ", "");
    console.log("token", token);
    if (!token) {
        return res.status(403).send({ error: "No token Provided 🙆🏻‍♂️" });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: "Token expired 😓" });
            }
            return res.status(401).json({ error: "Unauthorized 😠" });
        }
        if (!decode || !decode.userId) {
            return res.status(401).json({ error: "Invalid token 😕" });
        }
        console.log(decode);
        req.userId = decode.userId;
        next();
    });
};
