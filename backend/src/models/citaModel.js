const { sql, getConnection } = require('../config/db');

const obtenerCitas = async () => {
  const pool = await getConnection();
  const result = await pool.request().query(`
    SELECT 
      C.CitaId, C.MascotaId, C.VeterinarioId, C.FechaHora, C.Motivo,
      C.EstadoCitaId, C.FechaCreacion,
      M.Nombre AS NombreMascota,
      CL.NombreCompleto AS NombreCliente,
      U.NombreCompleto AS NombreVeterinario,
      E.NombreEstado
    FROM Citas C
    INNER JOIN Mascotas M ON C.MascotaId = M.MascotaId
    INNER JOIN Clientes CL ON M.ClienteId = CL.ClienteId
    INNER JOIN Usuarios U ON C.VeterinarioId = U.UsuarioId
    INNER JOIN EstadosCita E ON C.EstadoCitaId = E.EstadoCitaId
    ORDER BY C.FechaHora DESC
  `);
  return result.recordset;
};

const obtenerCitaPorId = async (id) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT 
        C.CitaId, C.MascotaId, C.VeterinarioId, C.FechaHora, C.Motivo,
        C.EstadoCitaId, C.FechaCreacion,
        M.Nombre AS NombreMascota,
        CL.NombreCompleto AS NombreCliente,
        U.NombreCompleto AS NombreVeterinario,
        E.NombreEstado
      FROM Citas C
      INNER JOIN Mascotas M ON C.MascotaId = M.MascotaId
      INNER JOIN Clientes CL ON M.ClienteId = CL.ClienteId
      INNER JOIN Usuarios U ON C.VeterinarioId = U.UsuarioId
      INNER JOIN EstadosCita E ON C.EstadoCitaId = E.EstadoCitaId
      WHERE C.CitaId = @id
    `);
  return result.recordset[0];
};

const obtenerCitasPorFecha = async (fecha) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('fecha', sql.Date, fecha)
    .query(`
      SELECT 
        C.CitaId, C.MascotaId, C.VeterinarioId, C.FechaHora, C.Motivo,
        C.EstadoCitaId, C.FechaCreacion,
        M.Nombre AS NombreMascota,
        CL.NombreCompleto AS NombreCliente,
        U.NombreCompleto AS NombreVeterinario,
        E.NombreEstado
      FROM Citas C
      INNER JOIN Mascotas M ON C.MascotaId = M.MascotaId
      INNER JOIN Clientes CL ON M.ClienteId = CL.ClienteId
      INNER JOIN Usuarios U ON C.VeterinarioId = U.UsuarioId
      INNER JOIN EstadosCita E ON C.EstadoCitaId = E.EstadoCitaId
      WHERE CAST(C.FechaHora AS DATE) = @fecha
      ORDER BY C.FechaHora
    `);
  return result.recordset;
};

const obtenerCitasPorMascota = async (mascotaId) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('mascotaId', sql.Int, mascotaId)
    .query(`
      SELECT 
        C.CitaId, C.MascotaId, C.VeterinarioId, C.FechaHora, C.Motivo,
        C.EstadoCitaId, C.FechaCreacion,
        M.Nombre AS NombreMascota,
        U.NombreCompleto AS NombreVeterinario,
        E.NombreEstado
      FROM Citas C
      INNER JOIN Mascotas M ON C.MascotaId = M.MascotaId
      INNER JOIN Usuarios U ON C.VeterinarioId = U.UsuarioId
      INNER JOIN EstadosCita E ON C.EstadoCitaId = E.EstadoCitaId
      WHERE C.MascotaId = @mascotaId
      ORDER BY C.FechaHora DESC
    `);
  return result.recordset;
};

const obtenerEstadosCita = async () => {
  const pool = await getConnection();
  const result = await pool.request().query(`
    SELECT EstadoCitaId, NombreEstado
    FROM EstadosCita
    ORDER BY EstadoCitaId
  `);
  return result.recordset;
};

const crearCita = async (datos) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('mascotaId', sql.Int, datos.mascotaId)
    .input('veterinarioId', sql.Int, datos.veterinarioId)
    .input('fechaHora', sql.DateTime, datos.fechaHora)
    .input('motivo', sql.NVarChar, datos.motivo)
    .query(`
      INSERT INTO Citas (MascotaId, VeterinarioId, FechaHora, Motivo, EstadoCitaId)
      VALUES (@mascotaId, @veterinarioId, @fechaHora, @motivo, 1);

      SELECT SCOPE_IDENTITY() AS CitaId;
    `);

  return result.recordset[0];
};

const cambiarEstadoCita = async (id, estadoCitaId) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('estadoCitaId', sql.Int, estadoCitaId)
    .query(`
      UPDATE Citas
      SET EstadoCitaId = @estadoCitaId
      WHERE CitaId = @id
    `);
  return result.rowsAffected[0] > 0;
};

const reprogramarCita = async (id, fechaHora) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('fechaHora', sql.DateTime, fechaHora)
    .query(`
      UPDATE Citas
      SET FechaHora = @fechaHora,
          EstadoCitaId = 1
      WHERE CitaId = @id
    `);
  return result.rowsAffected[0] > 0;
};

module.exports = {
  obtenerCitas,
  obtenerCitaPorId,
  obtenerCitasPorFecha,
  obtenerCitasPorMascota,
  obtenerEstadosCita,
  crearCita,
  cambiarEstadoCita,
  reprogramarCita
};