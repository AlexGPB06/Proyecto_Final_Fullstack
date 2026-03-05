const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(403).json({ message: 'Acceso denegado: Se requiere Token' });

    jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta_para_tokens', (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido o expirado' });
        req.user = user;
        next();
    });
};

const verificarAdmin = (req, res, next) => {
    if (req.user.rol !== 'admin') return res.status(403).json({ message: 'Acceso denegado: Privilegios de administrador requeridos' });
    next();
};

module.exports = { verificarToken, verificarAdmin };