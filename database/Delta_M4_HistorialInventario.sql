-- =============================================================
-- VetManager Pro - Delta M4: Ligar Historial Médico con Inventario
-- =============================================================
-- Autor:   Eduardo Beato
-- Rama:    modulo-eduardo-historial
-- Fecha:   Junio 2026
--
-- PROPÓSITO:
-- Este script añade las estructuras de BD necesarias para cumplir
-- la corrección "ligar historial con inventario".
-- Cuando un veterinario registra una consulta o aplica una vacuna,
-- los productos usados se descuentan automáticamente del inventario
-- (tabla Productos) y queda rastro en MovimientosInventario.
--
-- IMPORTANTE: 
--   - Ejecutar DESPUÉS del script base VetManagerPro.sql.
--   - Las Secciones 2, 3 y 4 son SOLO PARA PRUEBAS LOCALES.
--   - Para enviar a Feber, solo la SECCIÓN 1 es relevante.
-- =============================================================

USE VetManagerPro;
GO


-- =============================================================
-- SECCIÓN 1 — CAMBIOS DE ESQUEMA (esta es la parte que Feber 
-- necesita aprobar antes de mergear a main)
-- =============================================================

-- ----------------------------------------------------------
-- 1.1 Agregar ProductoId a VacunasMascotas
--
-- Justificación: una vacuna aplicada ES un producto del inventario.
-- Una sola columna NULL alcanza porque la relación es 1:1
-- (una vacuna aplicada = un solo producto descontado).
-- Se deja NULLABLE para permitir registrar vacunas históricas
-- que no tengan producto asociado.
-- ----------------------------------------------------------
ALTER TABLE VacunasMascotas
ADD ProductoId INT NULL;
GO

ALTER TABLE VacunasMascotas
ADD CONSTRAINT FK_Vacunas_Productos 
    FOREIGN KEY (ProductoId) REFERENCES Productos(ProductoId);
GO

CREATE NONCLUSTERED INDEX IX_VacunasMascotas_ProductoId 
    ON VacunasMascotas(ProductoId);
GO


-- ----------------------------------------------------------
-- 1.2 Crear tabla puente HistorialProductos
--
-- Justificación: una consulta puede usar VARIOS productos
-- (ej: antibiótico + desparasitante + jeringa). Por eso una 
-- columna directa en HistorialMedico no sirve — necesitamos
-- una tabla puente. Es el patrón estándar para relaciones N:N.
-- ----------------------------------------------------------
CREATE TABLE HistorialProductos (
    HistorialProductoId INT IDENTITY(1,1) PRIMARY KEY,
    HistorialId         INT NOT NULL,
    ProductoId          INT NOT NULL,
    Cantidad            INT NOT NULL CHECK (Cantidad > 0),

    CONSTRAINT FK_HistProd_Historial 
        FOREIGN KEY (HistorialId) REFERENCES HistorialMedico(HistorialId),
    CONSTRAINT FK_HistProd_Productos 
        FOREIGN KEY (ProductoId)  REFERENCES Productos(ProductoId)
);
GO

CREATE NONCLUSTERED INDEX IX_HistProd_HistorialId 
    ON HistorialProductos(HistorialId);
CREATE NONCLUSTERED INDEX IX_HistProd_ProductoId 
    ON HistorialProductos(ProductoId);
GO

PRINT '✓ Sección 1 completada: estructuras de BD creadas';
GO


-- =============================================================
-- SECCIÓN 2 — DATOS DE PRUEBA (solo ambiente local, NO se 
-- envía a main ni se ejecuta en producción)
-- =============================================================
-- Estos INSERTs crean lo mínimo para poder probar el flujo 
-- sin depender de que Miguel termine M2/M3 ni Erick termine M7.
-- =============================================================

-- 2.1 Usuario veterinario de prueba
-- Password: test1234  (hash bcryptjs, 10 rondas)
INSERT INTO Usuarios (NombreUsuario, PasswordHash, NombreCompleto, Correo, RolId)
VALUES ('vet_test', 
        '$2b$10$HDNPQDBEnMjt.EPcq7u1h.Fj1ioQfUe1kENAzLH1kz4o9HL6Jfhce',
        'Dr. Vet de Prueba', 'vet@test.com', 2); -- RolId 2 = Veterinario

-- 2.2 Cliente (dueño de mascota)
INSERT INTO Clientes (NombreCompleto, Telefono, Correo, Direccion)
VALUES ('Juan Pérez', '8095551234', 'juan@test.com', 'Calle Prueba 123');

-- 2.3 Mascota
INSERT INTO Mascotas (ClienteId, Nombre, Especie, Raza, FechaNacimiento, Sexo, Peso)
VALUES (
    (SELECT ClienteId FROM Clientes WHERE Correo = 'juan@test.com'),
    'Firulais', 'Perro', 'Labrador', '2022-05-10', 'M', 25.5
);

-- 2.4 Productos de inventario
INSERT INTO Productos (Nombre, Descripcion, CantidadActual, NivelMinimo) VALUES
('Amoxicilina 500mg',      'Antibiótico de amplio espectro', 50, 10),
('Vacuna Antirrábica',     'Vacuna anual contra la rabia',   30, 5),
('Desparasitante Drontal', 'Antiparasitario interno',        40, 8);

PRINT '✓ Sección 2 completada: datos de prueba cargados';
GO


-- =============================================================
-- SECCIÓN 3 — PRUEBA END-TO-END DE LA TRANSACCIÓN
-- =============================================================
-- Esta es exactamente la lógica que el backend ejecutará cuando 
-- un veterinario registre una consulta con productos. Si esto 
-- funciona en SQL puro, funcionará en Node.js sin sorpresas.
-- =============================================================

DECLARE @VetId            INT = (SELECT UsuarioId  FROM Usuarios  WHERE NombreUsuario = 'vet_test');
DECLARE @MascotaId        INT = (SELECT MascotaId  FROM Mascotas  WHERE Nombre = 'Firulais');
DECLARE @ProdAmox         INT = (SELECT ProductoId FROM Productos WHERE Nombre = 'Amoxicilina 500mg');
DECLARE @ProdDrontal      INT = (SELECT ProductoId FROM Productos WHERE Nombre = 'Desparasitante Drontal');
DECLARE @NuevoHistorialId INT;

BEGIN TRANSACTION;

BEGIN TRY
    -- Paso 1: crear el registro de historial médico
    INSERT INTO HistorialMedico (MascotaId, CitaId, VeterinarioId, Diagnostico, Tratamiento, NotasAdicionales)
    VALUES (@MascotaId, NULL, @VetId,
            'Infección leve en piel',
            'Amoxicilina 500mg cada 12h por 7 días + desparasitante',
            'Revisar en 1 semana');

    SET @NuevoHistorialId = SCOPE_IDENTITY();

    -- Paso 2: registrar los productos usados en esa consulta
    INSERT INTO HistorialProductos (HistorialId, ProductoId, Cantidad) 
        VALUES (@NuevoHistorialId, @ProdAmox,    2);
    INSERT INTO HistorialProductos (HistorialId, ProductoId, Cantidad) 
        VALUES (@NuevoHistorialId, @ProdDrontal, 1);

    -- Paso 3: crear los movimientos de salida en el inventario
    INSERT INTO MovimientosInventario (ProductoId, UsuarioId, TipoMovimiento, Cantidad, Observacion)
        VALUES (@ProdAmox,    @VetId, 'Salida', 2, CONCAT('Consulta #', @NuevoHistorialId));
    INSERT INTO MovimientosInventario (ProductoId, UsuarioId, TipoMovimiento, Cantidad, Observacion)
        VALUES (@ProdDrontal, @VetId, 'Salida', 1, CONCAT('Consulta #', @NuevoHistorialId));

    -- Paso 4: descontar el stock real
    UPDATE Productos SET CantidadActual = CantidadActual - 2 WHERE ProductoId = @ProdAmox;
    UPDATE Productos SET CantidadActual = CantidadActual - 1 WHERE ProductoId = @ProdDrontal;

    COMMIT TRANSACTION;
    PRINT '✓ Sección 3 completada: transacción exitosa, todo guardado';
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT '✗ ERROR en la transacción. Todo se revirtió:';
    PRINT ERROR_MESSAGE();
END CATCH;
GO


-- =============================================================
-- SECCIÓN 4 — QUERIES DE VERIFICACIÓN
-- =============================================================

PRINT '--- Historial creado ---';
SELECT TOP 1 * FROM HistorialMedico ORDER BY HistorialId DESC;

PRINT '--- Productos usados en esa consulta ---';
SELECT 
    hp.HistorialProductoId,
    hp.HistorialId,
    p.Nombre AS Producto,
    hp.Cantidad
FROM HistorialProductos hp
INNER JOIN Productos p ON hp.ProductoId = p.ProductoId
ORDER BY hp.HistorialProductoId DESC;

PRINT '--- Movimientos de inventario registrados ---';
SELECT TOP 5
    mi.MovimientoId,
    p.Nombre AS Producto,
    mi.TipoMovimiento,
    mi.Cantidad,
    mi.Observacion,
    mi.FechaMovimiento
FROM MovimientosInventario mi
INNER JOIN Productos p ON mi.ProductoId = p.ProductoId
ORDER BY mi.MovimientoId DESC;

PRINT '--- Stock actual (Amoxicilina debe estar en 48, Drontal en 39) ---';
SELECT ProductoId, Nombre, CantidadActual, NivelMinimo
FROM Productos
ORDER BY ProductoId;
GO
