const usuarioModel = require('../models/usuarioModel');

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
        const { nombreCompleto, rolId } = req.body;

        const actualizado = await usuarioModel.actualizarUsuario(id, { nombreCompleto, rolId });
        
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
        // Asumimos que si llaman a esta ruta, quieren desactivarlo (Estado = 0)
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

module.exports = { listarUsuarios, editarUsuario, desactivarUsuario };