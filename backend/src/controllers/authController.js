const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuarioModel');

const registrar = async (req, res) => {
    try {
        const { nombreUsuario, password, nombreCompleto, correo, rolId } = req.body;

        // Encriptar la contraseña antes de guardarla (10 rondas de sal)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const nuevoUsuario = {
            nombreUsuario,
            passwordHash,
            nombreCompleto,
            correo,
            rolId
        };

        const resultado = await usuarioModel.crearUsuario(nuevoUsuario);
        res.status(201).json({ mensaje: 'Usuario creado con éxito', usuarioId: resultado.UsuarioId });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Hubo un error al crear el usuario' });
    }
};

const login = async (req, res) => {
    console.log("Datos recibidos:", req.body);
    try {
        const { correo, password } = req.body;

        // 1. Buscar usuario
        const usuario = await usuarioModel.buscarUsuarioPorCorreo(correo);
        console.log("Usuario encontrado en DB:", usuario ? "Sí" : "No");
        
        if (!usuario) {
            return res.status(400).json({ error: 'Credenciales inválidas' });
        }

        // 2. Comparar contraseña
        const passwordValido = await bcrypt.compare(password, usuario.PasswordHash);
        console.log("¿Contraseña válida?:", passwordValido);
        
        if (!passwordValido) {
            return res.status(400).json({ error: 'Credenciales inválidas' });
        }

        // 3. Generar el JWT
        const payload = {
            usuarioId: usuario.UsuarioId,
            rolId: usuario.RolId,
            nombreCompleto: usuario.NombreCompleto
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

        res.status(200).json({
            mensaje: 'Login exitoso',
            token,
            usuario: payload
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Hubo un error al iniciar sesión' });
    }
};

module.exports = { registrar, login };