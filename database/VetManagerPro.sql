CREATE DATABASE VetManagerPro;
GO

USE VetManagerPro;
GO

-- ==========================================
-- M1: ACCESO Y USUARIOS
-- ==========================================
CREATE TABLE Roles (
    RolId INT IDENTITY(1,1) PRIMARY KEY,
    NombreRol NVARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Usuarios (
    UsuarioId INT IDENTITY(1,1) PRIMARY KEY,
    NombreUsuario NVARCHAR(50) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL CHECK (LEN(PasswordHash) >= 8),
    NombreCompleto NVARCHAR(100) NOT NULL,
    Correo NVARCHAR(100),
    RolId INT NOT NULL,
    Estado BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Usuarios_Roles FOREIGN KEY (RolId) REFERENCES Roles(RolId)
);

INSERT INTO Roles (NombreRol) VALUES ('Administrador'), ('Veterinario'), ('Recepcionista');

CREATE NONCLUSTERED INDEX IX_Usuarios_RolId ON Usuarios(RolId);
CREATE UNIQUE NONCLUSTERED INDEX UX_Usuarios_Correo ON Usuarios(Correo) WHERE Correo IS NOT NULL;

-- ==========================================
-- M2: CLIENTES Y MASCOTAS
-- ==========================================
CREATE TABLE Clientes (
    ClienteId INT IDENTITY(1,1) PRIMARY KEY,
    NombreCompleto NVARCHAR(100) NOT NULL,
    Telefono NVARCHAR(20) NOT NULL CHECK (Telefono NOT LIKE '%[a-zA-Z]%'),
    Correo NVARCHAR(100),
    Direccion NVARCHAR(255),
    Estado BIT NOT NULL DEFAULT 1,
    FechaRegistro DATETIME NOT NULL DEFAULT GETDATE()
);

CREATE UNIQUE NONCLUSTERED INDEX UX_Clientes_Correo ON Clientes(Correo) WHERE Correo IS NOT NULL;

CREATE TABLE Mascotas (
    MascotaId INT IDENTITY(1,1) PRIMARY KEY,
    ClienteId INT NOT NULL,
    Nombre NVARCHAR(80) NOT NULL,
    Especie NVARCHAR(50) NOT NULL, -- Texto libre para el MVP
    Raza NVARCHAR(50),             -- Texto libre para el MVP
    FechaNacimiento DATE,
    Sexo CHAR(1) CHECK (Sexo IN ('M', 'H')),
    Peso DECIMAL(6,2),
    Estado BIT NOT NULL DEFAULT 1,
    FechaRegistro DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Mascotas_Clientes FOREIGN KEY (ClienteId) REFERENCES Clientes(ClienteId)
);
CREATE NONCLUSTERED INDEX IX_Mascotas_ClienteId ON Mascotas(ClienteId);

-- ==========================================
-- M3: CITAS Y AGENDA
-- ==========================================
CREATE TABLE EstadosCita (
    EstadoCitaId INT IDENTITY(1,1) PRIMARY KEY,
    NombreEstado NVARCHAR(30) NOT NULL UNIQUE
);

INSERT INTO EstadosCita (NombreEstado) VALUES ('Pendiente'), ('Atendida'), ('Cancelada');

CREATE TABLE Citas (
    CitaId INT IDENTITY(1,1) PRIMARY KEY,
    MascotaId INT NOT NULL,
    VeterinarioId INT NOT NULL,
    FechaHora DATETIME NOT NULL,
    Motivo NVARCHAR(255) NOT NULL,
    EstadoCitaId INT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Citas_Mascotas FOREIGN KEY (MascotaId) REFERENCES Mascotas(MascotaId),
    CONSTRAINT FK_Citas_Veterinario FOREIGN KEY (VeterinarioId) REFERENCES Usuarios(UsuarioId),
    CONSTRAINT FK_Citas_Estados FOREIGN KEY (EstadoCitaId) REFERENCES EstadosCita(EstadoCitaId)
);
CREATE NONCLUSTERED INDEX IX_Citas_MascotaId ON Citas(MascotaId);
CREATE NONCLUSTERED INDEX IX_Citas_VeterinarioId ON Citas(VeterinarioId);
CREATE NONCLUSTERED INDEX IX_Citas_FechaHora ON Citas(FechaHora);

GO
-- TRIGGER: Prevenir citas duplicadas para el mismo veterinario (margen de 30 min)
CREATE TRIGGER TRG_PreventVetDoubleBooking
ON Citas
AFTER INSERT, UPDATE
AS
BEGIN
    IF EXISTS (
        SELECT 1
        FROM Citas C
        JOIN inserted I ON C.VeterinarioId = I.VeterinarioId 
                       AND C.CitaId <> I.CitaId
        WHERE C.EstadoCitaId = 1 
          AND I.EstadoCitaId = 1
          AND C.FechaHora < DATEADD(MINUTE, 30, I.FechaHora)
          AND DATEADD(MINUTE, 30, C.FechaHora) > I.FechaHora
    )
    BEGIN
        RAISERROR ('El veterinario ya tiene una cita asignada en ese horario.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

-- ==========================================
-- M4: HISTORIAL MÉDICO
-- ==========================================
CREATE TABLE HistorialMedico (
    HistorialId INT IDENTITY(1,1) PRIMARY KEY,
    MascotaId INT NOT NULL,
    CitaId INT NULL,
    VeterinarioId INT NOT NULL,
    Diagnostico NVARCHAR(500) NOT NULL,
    Tratamiento NVARCHAR(500),
    NotasAdicionales NVARCHAR(1000),
    FechaConsulta DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Historial_Mascotas FOREIGN KEY (MascotaId) REFERENCES Mascotas(MascotaId),
    CONSTRAINT FK_Historial_Citas FOREIGN KEY (CitaId) REFERENCES Citas(CitaId),
    CONSTRAINT FK_Historial_Veterinario FOREIGN KEY (VeterinarioId) REFERENCES Usuarios(UsuarioId)
);
CREATE NONCLUSTERED INDEX IX_HistorialMedico_MascotaId ON HistorialMedico(MascotaId);

CREATE TABLE VacunasMascotas (
    VacunaId INT IDENTITY(1,1) PRIMARY KEY,
    MascotaId INT NOT NULL,
    NombreVacuna NVARCHAR(100) NOT NULL,
    FechaAplicacion DATE NOT NULL,
    FechaProximaDosis DATE,
    VeterinarioId INT NOT NULL,

    CONSTRAINT FK_Vacunas_Mascotas FOREIGN KEY (MascotaId) REFERENCES Mascotas(MascotaId),
    CONSTRAINT FK_Vacunas_Veterinario FOREIGN KEY (VeterinarioId) REFERENCES Usuarios(UsuarioId)
);
CREATE NONCLUSTERED INDEX IX_VacunasMascotas_MascotaId ON VacunasMascotas(MascotaId);
CREATE NONCLUSTERED INDEX IX_VacunasMascotas_FechaProximaDosis ON VacunasMascotas(FechaProximaDosis);

-- ==========================================
-- M5: NOTIFICACIONES POR EMAIL
-- ==========================================
CREATE TABLE NotificacionesEmail (
    NotificacionId INT IDENTITY(1,1) PRIMARY KEY,
    ClienteId INT NOT NULL,
    MascotaId INT NULL,
    CitaId INT NULL,
    VacunaId INT NULL,
    TipoNotificacion NVARCHAR(50) NOT NULL CHECK (TipoNotificacion IN ('RecordatorioCita', 'ConfirmacionCita', 'VencimientoVacuna', 'RecogidaHotel')),
    CorreoDestino NVARCHAR(100) NOT NULL,
    Asunto NVARCHAR(150) NOT NULL,
    Mensaje NVARCHAR(MAX) NOT NULL,
    FechaEnvio DATETIME NULL,
    EstadoEnvio NVARCHAR(30) NOT NULL DEFAULT 'Pendiente' CHECK (EstadoEnvio IN ('Pendiente', 'Enviado', 'Fallido')),

    CONSTRAINT FK_Notificaciones_Clientes FOREIGN KEY (ClienteId) REFERENCES Clientes(ClienteId),
    CONSTRAINT FK_Notificaciones_Mascotas FOREIGN KEY (MascotaId) REFERENCES Mascotas(MascotaId),
    CONSTRAINT FK_Notificaciones_Citas FOREIGN KEY (CitaId) REFERENCES Citas(CitaId),
    CONSTRAINT FK_Notificaciones_Vacunas FOREIGN KEY (VacunaId) REFERENCES VacunasMascotas(VacunaId)
);
CREATE NONCLUSTERED INDEX IX_Notificaciones_EstadoEnvio ON NotificacionesEmail(EstadoEnvio);

-- ==========================================
-- M6: HOTEL / GUARDERÍA
-- ==========================================
CREATE TABLE EspaciosHotel (
    EspacioId INT IDENTITY(1,1) PRIMARY KEY,
    NumeroEspacio NVARCHAR(20) NOT NULL UNIQUE,
    Tipo NVARCHAR(30) NOT NULL CHECK (Tipo IN ('Pequeño', 'Mediano', 'Grande')),
    PrecioPorNoche DECIMAL(10,2) NOT NULL,
    Estado NVARCHAR(30) NOT NULL DEFAULT 'Disponible' CHECK (Estado IN ('Disponible', 'Ocupado', 'Mantenimiento'))
);

CREATE TABLE Hospedajes (
    HospedajeId INT IDENTITY(1,1) PRIMARY KEY,
    MascotaId INT NOT NULL,
    EspacioId INT NOT NULL,
    FechaEntrada DATETIME NOT NULL,
    FechaSalidaEstimada DATETIME NOT NULL,
    FechaSalidaReal DATETIME NULL,
    NotasEspeciales NVARCHAR(1000),
    TotalCobrar DECIMAL(10,2) NULL,
    Estado NVARCHAR(30) NOT NULL DEFAULT 'Activo' CHECK (Estado IN ('Activo', 'Completado', 'Cancelado')),

    CONSTRAINT FK_Hospedajes_Mascotas FOREIGN KEY (MascotaId) REFERENCES Mascotas(MascotaId),
    CONSTRAINT FK_Hospedajes_Espacios FOREIGN KEY (EspacioId) REFERENCES EspaciosHotel(EspacioId)
);
CREATE NONCLUSTERED INDEX IX_Hospedajes_MascotaId ON Hospedajes(MascotaId);
CREATE NONCLUSTERED INDEX IX_Hospedajes_EspacioId ON Hospedajes(EspacioId);

GO
-- TRIGGER: Prevenir que una mascota ocupe un espacio ya ocupado
CREATE TRIGGER TRG_PreventHotelOverlap
ON Hospedajes
AFTER INSERT, UPDATE
AS
BEGIN
    IF EXISTS (
        SELECT 1
        FROM Hospedajes H
        JOIN inserted I ON H.EspacioId = I.EspacioId 
                       AND H.HospedajeId <> I.HospedajeId
        WHERE H.Estado = 'Activo' AND I.Estado = 'Activo'
          AND H.FechaEntrada < I.FechaSalidaEstimada 
          AND H.FechaSalidaEstimada > I.FechaEntrada
    )
    BEGIN
        RAISERROR ('El espacio de hotel ya está ocupado en esas fechas.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

-- ==========================================
-- M7: INVENTARIO
-- ==========================================
CREATE TABLE Productos (
    ProductoId INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    Descripcion NVARCHAR(255),
    CantidadActual INT NOT NULL DEFAULT 0,
    NivelMinimo INT NOT NULL DEFAULT 0,
    Estado BIT NOT NULL DEFAULT 1,
    FechaRegistro DATETIME NOT NULL DEFAULT GETDATE()
);

CREATE TABLE MovimientosInventario (
    MovimientoId INT IDENTITY(1,1) PRIMARY KEY,
    ProductoId INT NOT NULL,
    UsuarioId INT NOT NULL, -- Quién registró el movimiento
    TipoMovimiento NVARCHAR(20) NOT NULL CHECK (TipoMovimiento IN ('Entrada', 'Salida', 'Ajuste')),
    Cantidad INT NOT NULL,
    FechaMovimiento DATETIME NOT NULL DEFAULT GETDATE(),
    Observacion NVARCHAR(255),

    CONSTRAINT FK_Movimientos_Productos FOREIGN KEY (ProductoId) REFERENCES Productos(ProductoId),
    CONSTRAINT FK_Movimientos_Usuarios FOREIGN KEY (UsuarioId) REFERENCES Usuarios(UsuarioId)
);
CREATE NONCLUSTERED INDEX IX_Movimientos_ProductoId ON MovimientosInventario(ProductoId);