const productoModel = require('../models/productoModel');

const listarProductos = async (req, res) => {
    try {
        const productos = await productoModel.obtenerProductos();
        res.status(200).json(productos);
    } catch (error) {
        console.error('Error al listar productos:', error);
        res.status(500).json({ error: 'Hubo un error al obtener el inventario' });
    }
};

const registrarProducto = async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock } = req.body;

        const creado = await productoModel.crearProducto({ nombre, descripcion, precio, stock });

        if (creado) {
            res.status(201).json({ mensaje: 'Producto registrado exitosamente' });
        } else {
            res.status(500).json({ error: 'No se pudo registrar el producto' });
        }
    } catch (error) {
        console.error('Error al registrar producto:', error);
        res.status(500).json({ error: 'Hubo un error interno al crear el producto' });
    }
};

const editarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, stock } = req.body;

        const actualizado = await productoModel.actualizarProducto(id, { nombre, descripcion, precio, stock });
        
        if (actualizado) {
            res.status(200).json({ mensaje: 'Producto actualizado con éxito' });
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ error: 'Hubo un error al actualizar el producto' });
    }
};

const desactivarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const desactivado = await productoModel.cambiarEstadoProducto(id, 0);
        
        if (desactivado) {
            res.status(200).json({ mensaje: 'Producto desactivado con éxito (Fuera de stock/inventario)' });
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error('Error al desactivar producto:', error);
        res.status(500).json({ error: 'Hubo un error al desactivar el producto' });
    }
};

module.exports = { listarProductos, registrarProducto, editarProducto, desactivarProducto };