const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access denied. Login required." });
    }
    try {
        req.user = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
        if (!req.user || !req.user.id || !req.user.role) {
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
