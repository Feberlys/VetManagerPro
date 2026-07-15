const { sql, getConnection } = require('../config/db');

const obtenerClientes = async () => {
  const pool = await getConnection();
  const result = await pool.request().query(`
    SELECT ClienteId, NombreCompleto, Telefono, Correo, Direccion, Estado, FechaRegistro
    FROM Clientes
    ORDER BY FechaRegistro DESC
  `);
  return result.recordset;
};

const obtenerClientes = async () => {
    const token = localStorage.getItem('token'); // Recuperamos el token aquí
    return await api.get('/clientes', {
        headers: {
            'Authorization': `Bearer ${token}` // Lo enviamos explícitamente
        }
    });
};

const obtenerClientePorId = async (id) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT ClienteId, NombreCompleto, Telefono, Correo, Direccion, Estado, FechaRegistro
      FROM Clientes
      WHERE ClienteId = @id
    `);
  return result.recordset[0];
};

const buscarClientes = async (nombre) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('nombre', sql.NVarChar, `%${nombre}%`)
    .query(`
      SELECT ClienteId, NombreCompleto, Telefono, Correo, Direccion, Estado, FechaRegistro
      FROM Clientes
      WHERE NombreCompleto LIKE @nombre
      ORDER BY NombreCompleto
    `);
  return result.recordset;
};

const crearCliente = async (datos) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('nombreCompleto', sql.NVarChar, datos.nombreCompleto)
    .input('telefono', sql.NVarChar, datos.telefono)
    .input('correo', sql.NVarChar, datos.correo || null)
    .input('direccion', sql.NVarChar, datos.direccion || null)
    .query(`
      INSERT INTO Clientes (NombreCompleto, Telefono, Correo, Direccion, Estado)
      OUTPUT INSERTED.ClienteId
      VALUES (@nombreCompleto, @telefono, @correo, @direccion, 1)
    `);
  return result.recordset[0];
};

const actualizarCliente = async (id, datos) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('nombreCompleto', sql.NVarChar, datos.nombreCompleto)
    .input('telefono', sql.NVarChar, datos.telefono)
    .input('correo', sql.NVarChar, datos.correo || null)
    .input('direccion', sql.NVarChar, datos.direccion || null)
    .query(`
      UPDATE Clientes
      SET NombreCompleto = @nombreCompleto,
          Telefono = @telefono,
          Correo = @correo,
          Direccion = @direccion
      WHERE ClienteId = @id
    `);
  return result.rowsAffected[0] > 0;
};

const cambiarEstadoCliente = async (id, estado) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('estado', sql.Bit, estado)
    .query(`
      UPDATE Clientes
      SET Estado = @estado
      WHERE ClienteId = @id
    `);
  return result.rowsAffected[0] > 0;
};

module.exports = {
  obtenerClientes,
  obtenerClientePorId,
  buscarClientes,
  crearCliente,
  actualizarCliente,
  cambiarEstadoCliente
};