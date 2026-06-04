const { sql, getConnection } = require('../config/db');

const obtenerMascotas = async () => {
  const pool = await getConnection();
  const result = await pool.request().query(`
    SELECT 
      M.MascotaId, M.ClienteId, M.Nombre, M.Especie, M.Raza,
      M.FechaNacimiento, M.Sexo, M.Peso, M.Estado, M.FechaRegistro,
      C.NombreCompleto AS NombreCliente
    FROM Mascotas M
    INNER JOIN Clientes C ON M.ClienteId = C.ClienteId
    ORDER BY M.FechaRegistro DESC
  `);
  return result.recordset;
};

const obtenerMascotaPorId = async (id) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT 
        M.MascotaId, M.ClienteId, M.Nombre, M.Especie, M.Raza,
        M.FechaNacimiento, M.Sexo, M.Peso, M.Estado, M.FechaRegistro,
        C.NombreCompleto AS NombreCliente
      FROM Mascotas M
      INNER JOIN Clientes C ON M.ClienteId = C.ClienteId
      WHERE M.MascotaId = @id
    `);
  return result.recordset[0];
};

const obtenerMascotasPorCliente = async (clienteId) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('clienteId', sql.Int, clienteId)
    .query(`
      SELECT MascotaId, ClienteId, Nombre, Especie, Raza, FechaNacimiento, Sexo, Peso, Estado, FechaRegistro
      FROM Mascotas
      WHERE ClienteId = @clienteId
      ORDER BY Nombre
    `);
  return result.recordset;
};

const buscarMascotas = async (nombre) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('nombre', sql.NVarChar, `%${nombre}%`)
    .query(`
      SELECT 
        M.MascotaId, M.ClienteId, M.Nombre, M.Especie, M.Raza,
        M.FechaNacimiento, M.Sexo, M.Peso, M.Estado, M.FechaRegistro,
        C.NombreCompleto AS NombreCliente
      FROM Mascotas M
      INNER JOIN Clientes C ON M.ClienteId = C.ClienteId
      WHERE M.Nombre LIKE @nombre
      ORDER BY M.Nombre
    `);
  return result.recordset;
};

const crearMascota = async (datos) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('clienteId', sql.Int, datos.clienteId)
    .input('nombre', sql.NVarChar, datos.nombre)
    .input('especie', sql.NVarChar, datos.especie)
    .input('raza', sql.NVarChar, datos.raza || null)
    .input('fechaNacimiento', sql.Date, datos.fechaNacimiento || null)
    .input('sexo', sql.Char, datos.sexo || null)
    .input('peso', sql.Decimal(6, 2), datos.peso || null)
    .query(`
      INSERT INTO Mascotas (ClienteId, Nombre, Especie, Raza, FechaNacimiento, Sexo, Peso, Estado)
      OUTPUT INSERTED.MascotaId
      VALUES (@clienteId, @nombre, @especie, @raza, @fechaNacimiento, @sexo, @peso, 1)
    `);
  return result.recordset[0];
};

const actualizarMascota = async (id, datos) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('clienteId', sql.Int, datos.clienteId)
    .input('nombre', sql.NVarChar, datos.nombre)
    .input('especie', sql.NVarChar, datos.especie)
    .input('raza', sql.NVarChar, datos.raza || null)
    .input('fechaNacimiento', sql.Date, datos.fechaNacimiento || null)
    .input('sexo', sql.Char, datos.sexo || null)
    .input('peso', sql.Decimal(6, 2), datos.peso || null)
    .query(`
      UPDATE Mascotas
      SET ClienteId = @clienteId,
          Nombre = @nombre,
          Especie = @especie,
          Raza = @raza,
          FechaNacimiento = @fechaNacimiento,
          Sexo = @sexo,
          Peso = @peso
      WHERE MascotaId = @id
    `);
  return result.rowsAffected[0] > 0;
};

const cambiarEstadoMascota = async (id, estado) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('estado', sql.Bit, estado)
    .query(`
      UPDATE Mascotas
      SET Estado = @estado
      WHERE MascotaId = @id
    `);
  return result.rowsAffected[0] > 0;
};

module.exports = {
  obtenerMascotas,
  obtenerMascotaPorId,
  obtenerMascotasPorCliente,
  buscarMascotas,
  crearMascota,
  actualizarMascota,
  cambiarEstadoMascota
};