const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access denied. Login required." });
    }
    try {
        req.user = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);                      //Header ni space based on split chesthundi.["Bearer", "token123"],,Index 1 lo unna token ni extract chesthundi.                Token verify ayina tarvatha payload lo required details unnaya leda check chesthunnam.3 conditions check chesthunnam: req.user, req.user.id, req.user.role. Ledu ante 401 Unauthorized response return chesthundi.
        if (!req.user || !req.user.id || !req.user.role) {                                     //Token verify ayyaka andulo unna payload ni req.user lo store chesthunnam.
            return res.status(401).json({ message: "Invalid token." });
        }
        next();
    } catch {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
}

function allowRoles(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden. You do not have permission." });
        }
        next();
    };
}

module.exports = { verifyToken, allowRoles };










// Execution flow:
// 1. /profile API ki request vasthundi.
// 2. verifyToken execute avuthundi.
// 3. Token verify avuthundi.
// 4. next() call avuthundi.
// 5. getProfile controller execute avuthundi.

// allowRoles() function
// Ippativaraku token valid aa kaadha ani check chesam.
// But valid token unna user ki every API access ivvakudadhu.
// Example:
// - Student → Student pages access.
// - Admin → Admin pages access.
// Daanikosam allowRoles() use chestham.