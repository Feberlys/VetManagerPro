const jwt = require('jsonwebtoken');

// Verifica que el usuario tenga una sesión válida
const verificarToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ error: 'Acceso denegado. No hay token proporcionado.' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = payload; // Guardamos los datos del usuario en la petición
        next(); // Pasa a la siguiente función
    } catch (error) {
        res.status(400).json({ error: 'Token inválido o expirado.' });
    }
};

// Verifica que el usuario sea Administrador
const esAdmin = (req, res, next) => {
    if (req.usuario.rolId !== 1) {
        return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de Administrador.' });
    }
    next();
};

module.exports = { verificarToken, esAdmin };