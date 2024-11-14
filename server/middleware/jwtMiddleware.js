const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const token = req.body.token || req.query.token || req.headers['x-access-token'] || req.params.token || req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).send('Access denied');
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).send('Invalid token');
    }
}

module.exports = verifyToken;