const usuarioModel = require('../models/usuarioModel');
const bcrypt = require('bcryptjs');

const listarUsuarios = async (req, res) => {
    try {
        const usuarios = await usuarioModel.obtenerUsuarios();
        res.status(200).json(usuarios);
    } catch (error) {
        console.error('Error al listar usuarios:', error);
        res.status(500).json({ error: 'Hubo un error al obtener los usuarios' });
    }
};

const editarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombreUsuario, nombreCompleto, correo, password, rolId } = req.body;

        const datosActualizar = {
            nombreUsuario,
            nombreCompleto,
            correo,
            rolId
        };

        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            datosActualizar.passwordHash = await bcrypt.hash(password, salt);
        }

        const actualizado = await usuarioModel.actualizarUsuario(id, datosActualizar);
        
        if (actualizado) {
            res.status(200).json({ mensaje: 'Usuario actualizado con éxito' });
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ error: 'Hubo un error al actualizar el usuario' });
    }
};

const desactivarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const desactivado = await usuarioModel.cambiarEstadoUsuario(id, 0);
        
        if (desactivado) {
            res.status(200).json({ mensaje: 'Usuario desactivado con éxito' });
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error al desactivar usuario:', error);
        res.status(500).json({ error: 'Hubo un error al desactivar el usuario' });
    }
};

const crearUsuarioAdmin = async (req, res) => {
    try {
        const { nombreUsuario, nombreCompleto, correo, password, rolId } = req.body;

        // Validar si el usuario ya existe
        const existe = await usuarioModel.buscarUsuarioPorCorreo(correo);
        if (existe) {
            return res.status(400).json({ error: 'El correo ya está registrado en el sistema.' });
        }

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Llamamos al modelo (pasando los parámetros sueltos, como seguro lo tenías en tu ruta de auth)
        const creado = await usuarioModel.crearUsuario({nombreUsuario, nombreCompleto, correo, passwordHash, rolId});

        if (creado) {
            res.status(201).json({ mensaje: 'Usuario creado exitosamente' });
        } else {
            res.status(500).json({ error: 'No se pudo registrar el usuario' });
        }
    } catch (error) {
        console.error('Error al crear usuario desde Admin:', error);
        res.status(500).json({ error: 'Hubo un error interno al crear el usuario' });
    }
};

const activarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const activado = await usuarioModel.cambiarEstadoUsuario(id, 1); // 1 = Activo
        
        if (activado) {
            res.status(200).json({ mensaje: 'Usuario reactivado con éxito' });
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error al reactivar usuario:', error);
        res.status(500).json({ error: 'Hubo un error al reactivar el usuario' });
    }
};

const listarVeterinarios = async (req, res) => {
    try {
        const veterinarios = await usuarioModel.obtenerVeterinarios();
        res.status(200).json(veterinarios);
    } catch (error) {
        console.error('Error al listar veterinarios:', error);
        res.status(500).json({ error: 'Hubo un error al obtener los veterinarios' });
    }
};

module.exports = { listarUsuarios, editarUsuario, desactivarUsuario, crearUsuarioAdmin, activarUsuario, listarVeterinarios };