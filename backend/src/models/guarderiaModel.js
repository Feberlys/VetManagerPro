const { sql, getConnection } = require('../config/db');

const getEspaciosHotel = async () => {
  const pool = await getConnection();

  const result = await pool.request().query(`
    SELECT 
      EspacioId,
      NumeroEspacio,
      Tipo,
      PrecioPorNoche,
      Estado
    FROM EspaciosHotel
    ORDER BY NumeroEspacio
  `);

  return result.recordset;
};

const getEspaciosDisponibles = async () => {
  const pool = await getConnection();

  const result = await pool.request().query(`
    SELECT 
      EspacioId,
      NumeroEspacio,
      Tipo,
      PrecioPorNoche,
      Estado
    FROM EspaciosHotel
    WHERE Estado = 'Disponible'
    ORDER BY NumeroEspacio
  `);

  return result.recordset;
};

const crearEspacioHotel = async (numeroEspacio, tipo, precioPorNoche) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input('NumeroEspacio', sql.NVarChar(20), numeroEspacio)
    .input('Tipo', sql.NVarChar(30), tipo)
    .input('PrecioPorNoche', sql.Decimal(10, 2), precioPorNoche)
    .query(`
      INSERT INTO EspaciosHotel 
        (NumeroEspacio, Tipo, PrecioPorNoche, Estado)
      OUTPUT INSERTED.*
      VALUES 
        (@NumeroEspacio, @Tipo, @PrecioPorNoche, 'Disponible')
    `);

  return result.recordset[0];
};

const actualizarEspacioHotel = async (espacioId, numeroEspacio, tipo, precioPorNoche, estado) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input('EspacioId', sql.Int, espacioId)
    .input('NumeroEspacio', sql.NVarChar(20), numeroEspacio)
    .input('Tipo', sql.NVarChar(30), tipo)
    .input('PrecioPorNoche', sql.Decimal(10, 2), precioPorNoche)
    .input('Estado', sql.NVarChar(30), estado)
    .query(`
      UPDATE EspaciosHotel
      SET 
        NumeroEspacio = @NumeroEspacio,
        Tipo = @Tipo,
        PrecioPorNoche = @PrecioPorNoche,
        Estado = @Estado
      OUTPUT INSERTED.*
      WHERE EspacioId = @EspacioId
    `);

  return result.recordset[0];
};

const hacerCheckIn = async (mascotaId, espacioId, fechaEntrada, fechaSalidaEstimada, notasEspeciales) => {
  const pool = await getConnection();

  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const requestHospedaje = new sql.Request(transaction);

    const hospedajeResult = await requestHospedaje
      .input('MascotaId', sql.Int, mascotaId)
      .input('EspacioId', sql.Int, espacioId)
      .input('FechaEntrada', sql.DateTime, fechaEntrada)
      .input('FechaSalidaEstimada', sql.DateTime, fechaSalidaEstimada)
      .input('NotasEspeciales', sql.NVarChar(1000), notasEspeciales || null)
      .query(`
        INSERT INTO Hospedajes
          (MascotaId, EspacioId, FechaEntrada, FechaSalidaEstimada, NotasEspeciales, Estado)
        VALUES
          (@MascotaId, @EspacioId, @FechaEntrada, @FechaSalidaEstimada, @NotasEspeciales, 'Activo');

        SELECT *
        FROM Hospedajes
        WHERE HospedajeId = SCOPE_IDENTITY();
      `);

    const requestEspacio = new sql.Request(transaction);

    await requestEspacio
      .input('EspacioId', sql.Int, espacioId)
      .query(`
        UPDATE EspaciosHotel
        SET Estado = 'Ocupado'
        WHERE EspacioId = @EspacioId
      `);

    await transaction.commit();

    return hospedajeResult.recordset[0];
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getOcupacionHotel = async () => {
  const pool = await getConnection();

  const result = await pool.request().query(`
    SELECT 
      H.HospedajeId,
      H.MascotaId,
      M.Nombre AS NombreMascota,
      M.Especie,
      C.ClienteId,
      C.NombreCompleto AS NombreCliente,
      C.Correo,
      C.Telefono,
      E.EspacioId,
      E.NumeroEspacio,
      E.Tipo,
      E.PrecioPorNoche,
      H.FechaEntrada,
      H.FechaSalidaEstimada,
      H.FechaSalidaReal,
      H.NotasEspeciales,
      H.TotalCobrar,
      H.Estado
    FROM Hospedajes H
    INNER JOIN Mascotas M ON H.MascotaId = M.MascotaId
    INNER JOIN Clientes C ON M.ClienteId = C.ClienteId
    INNER JOIN EspaciosHotel E ON H.EspacioId = E.EspacioId
    WHERE H.Estado = 'Activo'
    ORDER BY H.FechaEntrada DESC
  `);

  return result.recordset;
};

const getHospedajeById = async (hospedajeId) => {
  const pool = await getConnection();

  const result = await pool.request()
    .input('HospedajeId', sql.Int, hospedajeId)
    .query(`
      SELECT 
        H.HospedajeId,
        H.MascotaId,
        M.Nombre AS NombreMascota,
        C.ClienteId,
        C.NombreCompleto AS NombreCliente,
        C.Correo,
        E.EspacioId,
        E.NumeroEspacio,
        E.PrecioPorNoche,
        H.FechaEntrada,
        H.FechaSalidaEstimada,
        H.FechaSalidaReal,
        H.NotasEspeciales,
        H.TotalCobrar,
        H.Estado
      FROM Hospedajes H
      INNER JOIN Mascotas M ON H.MascotaId = M.MascotaId
      INNER JOIN Clientes C ON M.ClienteId = C.ClienteId
      INNER JOIN EspaciosHotel E ON H.EspacioId = E.EspacioId
      WHERE H.HospedajeId = @HospedajeId
    `);

  return result.recordset[0];
};

const hacerCheckOut = async (hospedajeId, fechaSalidaReal, totalCobrar) => {
  const pool = await getConnection();

  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const requestHospedaje = new sql.Request(transaction);

    const hospedajeResult = await requestHospedaje
      .input('HospedajeId', sql.Int, hospedajeId)
      .input('FechaSalidaReal', sql.DateTime, fechaSalidaReal)
      .input('TotalCobrar', sql.Decimal(10, 2), totalCobrar)
      .query(`
        UPDATE Hospedajes
        SET 
          FechaSalidaReal = @FechaSalidaReal,
          TotalCobrar = @TotalCobrar,
          Estado = 'Completado'
        WHERE HospedajeId = @HospedajeId;

        SELECT *
        FROM Hospedajes
        WHERE HospedajeId = @HospedajeId;
      `);

    const hospedajeActualizado = hospedajeResult.recordset[0];

    const requestEspacio = new sql.Request(transaction);

    await requestEspacio
      .input('EspacioId', sql.Int, hospedajeActualizado.EspacioId)
      .query(`
        UPDATE EspaciosHotel
        SET Estado = 'Disponible'
        WHERE EspacioId = @EspacioId
      `);

    await transaction.commit();

    return hospedajeActualizado;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  getEspaciosHotel,
  getEspaciosDisponibles,
  crearEspacioHotel,
  actualizarEspacioHotel,
  hacerCheckIn,
  getOcupacionHotel,
  getHospedajeById,
  hacerCheckOut
};