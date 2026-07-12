# [VetManagerPro]
USE [master]
GO

/****** Object:  Database [VetManagerPro]    Script Date: 7/12/2026 5:22:06 PM ******/
CREATE DATABASE [VetManagerPro]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'VetManagerPro', FILENAME = N'C:\Users\Admin\VetManagerPro.mdf' , SIZE = 8192KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'VetManagerPro_log', FILENAME = N'C:\Users\Admin\VetManagerPro_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO
ALTER DATABASE [VetManagerPro] SET COMPATIBILITY_LEVEL = 170
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [VetManagerPro].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [VetManagerPro] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [VetManagerPro] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [VetManagerPro] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [VetManagerPro] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [VetManagerPro] SET ARITHABORT OFF 
GO
ALTER DATABASE [VetManagerPro] SET AUTO_CLOSE ON 
GO
ALTER DATABASE [VetManagerPro] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [VetManagerPro] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [VetManagerPro] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [VetManagerPro] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [VetManagerPro] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [VetManagerPro] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [VetManagerPro] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [VetManagerPro] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [VetManagerPro] SET  ENABLE_BROKER 
GO
ALTER DATABASE [VetManagerPro] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [VetManagerPro] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [VetManagerPro] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [VetManagerPro] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [VetManagerPro] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [VetManagerPro] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [VetManagerPro] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [VetManagerPro] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [VetManagerPro] SET  MULTI_USER 
GO
ALTER DATABASE [VetManagerPro] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [VetManagerPro] SET DB_CHAINING OFF 
GO
ALTER DATABASE [VetManagerPro] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [VetManagerPro] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [VetManagerPro] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [VetManagerPro] SET OPTIMIZED_LOCKING = OFF 
GO
ALTER DATABASE [VetManagerPro] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
ALTER DATABASE [VetManagerPro] SET QUERY_STORE = ON
GO
ALTER DATABASE [VetManagerPro] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO

# [dbo].[Citas]
USE [VetManagerPro]
GO

/****** Object:  Table [dbo].[Citas]    Script Date: 7/12/2026 5:22:06 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Citas](
	[CitaId] [int] IDENTITY(1,1) NOT NULL,
	[MascotaId] [int] NOT NULL,
	[VeterinarioId] [int] NOT NULL,
	[FechaHora] [datetime] NOT NULL,
	[Motivo] [nvarchar](255) NOT NULL,
	[EstadoCitaId] [int] NOT NULL,
	[FechaCreacion] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[CitaId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

# [dbo].[Clientes]
/****** Object:  Table [dbo].[Clientes]    Script Date: 7/12/2026 5:22:06 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Clientes](
	[ClienteId] [int] IDENTITY(1,1) NOT NULL,
	[NombreCompleto] [nvarchar](100) NOT NULL,
	[Telefono] [nvarchar](20) NOT NULL,
	[Correo] [nvarchar](100) NULL,
	[Direccion] [nvarchar](255) NULL,
	[Estado] [bit] NOT NULL,
	[FechaRegistro] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ClienteId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

# [dbo].[EspaciosHotel]
/****** Object:  Table [dbo].[EspaciosHotel]    Script Date: 7/12/2026 5:22:06 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EspaciosHotel](
	[EspacioId] [int] IDENTITY(1,1) NOT NULL,
	[NumeroEspacio] [nvarchar](20) NOT NULL,
	[Tipo] [nvarchar](30) NOT NULL,
	[PrecioPorNoche] [decimal](10, 2) NOT NULL,
	[Estado] [nvarchar](30) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[EspacioId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[NumeroEspacio] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

# [dbo].[EstadosCita]
/****** Object:  Table [dbo].[EstadosCita]    Script Date: 7/12/2026 5:22:06 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EstadosCita](
	[EstadoCitaId] [int] IDENTITY(1,1) NOT NULL,
	[NombreEstado] [nvarchar](30) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[EstadoCitaId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[NombreEstado] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

# [dbo].[HistorialMedico]
/****** Object:  Table [dbo].[HistorialMedico]    Script Date: 7/12/2026 5:22:06 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[HistorialMedico](
	[HistorialId] [int] IDENTITY(1,1) NOT NULL,
	[MascotaId] [int] NOT NULL,
	[CitaId] [int] NULL,
	[VeterinarioId] [int] NOT NULL,
	[Diagnostico] [nvarchar](500) NOT NULL,
	[Tratamiento] [nvarchar](500) NULL,
	[NotasAdicionales] [nvarchar](1000) NULL,
	[FechaConsulta] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[HistorialId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

# [dbo].[HistorialProductos]
/****** Object:  Table [dbo].[HistorialProductos]    Script Date: 7/12/2026 5:22:06 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[HistorialProductos](
	[HistorialProductoId] [int] IDENTITY(1,1) NOT NULL,
	[HistorialId] [int] NOT NULL,
	[ProductoId] [int] NOT NULL,
	[Cantidad] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[HistorialProductoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

# [dbo].[Hospedajes]
/****** Object:  Table [dbo].[Hospedajes]    Script Date: 7/12/2026 5:22:06 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Hospedajes](
	[HospedajeId] [int] IDENTITY(1,1) NOT NULL,
	[MascotaId] [int] NOT NULL,
	[EspacioId] [int] NOT NULL,
	[FechaEntrada] [datetime] NOT NULL,
	[FechaSalidaEstimada] [datetime] NOT NULL,
	[FechaSalidaReal] [datetime] NULL,
	[NotasEspeciales] [nvarchar](1000) NULL,
	[TotalCobrar] [decimal](10, 2) NULL,
	[Estado] [nvarchar](30) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[HospedajeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

# [dbo].[Mascotas]
/****** Object:  Table [dbo].[Mascotas]    Script Date: 7/12/2026 5:22:06 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Mascotas](
	[MascotaId] [int] IDENTITY(1,1) NOT NULL,
	[ClienteId] [int] NOT NULL,
	[Nombre] [nvarchar](80) NOT NULL,
	[Especie] [nvarchar](50) NOT NULL,
	[Raza] [nvarchar](50) NULL,
	[FechaNacimiento] [date] NULL,
	[Sexo] [char](1) NULL,
	[Peso] [decimal](6, 2) NULL,
	[Estado] [bit] NOT NULL,
	[FechaRegistro] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MascotaId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

# [dbo].[MovimientosInventario]
/****** Object:  Table [dbo].[MovimientosInventario]    Script Date: 7/12/2026 5:22:06 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MovimientosInventario](
	[MovimientoId] [int] IDENTITY(1,1) NOT NULL,
	[ProductoId] [int] NOT NULL,
	[UsuarioId] [int] NOT NULL,
	[TipoMovimiento] [nvarchar](20) NOT NULL,
	[Cantidad] [int] NOT NULL,
	[FechaMovimiento] [datetime] NOT NULL,
	[Observacion] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[MovimientoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

# [dbo].[NotificacionesEmail]
/****** Object:  Table [dbo].[NotificacionesEmail]    Script Date: 7/12/2026 5:22:06 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[NotificacionesEmail](
	[NotificacionId] [int] IDENTITY(1,1) NOT NULL,
	[ClienteId] [int] NOT NULL,
	[MascotaId] [int] NULL,
	[CitaId] [int] NULL,
	[VacunaId] [int] NULL,
	[TipoNotificacion] [nvarchar](50) NOT NULL,
	[CorreoDestino] [nvarchar](100) NOT NULL,
	[Asunto] [nvarchar](150) NOT NULL,
	[Mensaje] [nvarchar](max) NOT NULL,
	[FechaEnvio] [datetime] NULL,
	[EstadoEnvio] [nvarchar](30) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[NotificacionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

# [dbo].[Productos]
/****** Object:  Table [dbo].[Productos]    Script Date: 7/12/2026 5:22:06 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Productos](
	[ProductoId] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [nvarchar](100) NOT NULL,
	[Descripcion] [nvarchar](255) NULL,
	[CantidadActual] [int] NOT NULL,
	[NivelMinimo] [int] NOT NULL,
	[Estado] [bit] NOT NULL,
	[FechaRegistro] [datetime] NOT NULL,
	[Categoria] [nvarchar](50) NULL,
	[FechaVencimiento] [date] NULL,
PRIMARY KEY CLUSTERED 
(
	[ProductoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

# [dbo].[Roles]
/****** Object:  Table [dbo].[Roles]    Script Date: 7/12/2026 5:22:06 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Roles](
	[RolId] [int] IDENTITY(1,1) NOT NULL,
	[NombreRol] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RolId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[NombreRol] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

# [dbo].[Usuarios]
/****** Object:  Table [dbo].[Usuarios]    Script Date: 7/12/2026 5:22:06 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Usuarios](
	[UsuarioId] [int] IDENTITY(1,1) NOT NULL,
	[NombreUsuario] [nvarchar](50) NOT NULL,
	[PasswordHash] [nvarchar](255) NOT NULL,
	[NombreCompleto] [nvarchar](100) NOT NULL,
	[Correo] [nvarchar](100) NULL,
	[RolId] [int] NOT NULL,
	[Estado] [bit] NOT NULL,
	[FechaCreacion] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[UsuarioId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[NombreUsuario] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

# [dbo].[VacunasMascotas]
/****** Object:  Table [dbo].[VacunasMascotas]    Script Date: 7/12/2026 5:22:06 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[VacunasMascotas](
	[VacunaId] [int] IDENTITY(1,1) NOT NULL,
	[MascotaId] [int] NOT NULL,
	[NombreVacuna] [nvarchar](100) NOT NULL,
	[FechaAplicacion] [date] NOT NULL,
	[FechaProximaDosis] [date] NULL,
	[VeterinarioId] [int] NOT NULL,
	[ProductoId] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[VacunaId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

# [IX_Citas_FechaHora]
/****** Object:  Index [IX_Citas_FechaHora]    Script Date: 7/12/2026 5:22:06 PM ******/
CREATE NONCLUSTERED INDEX [IX_Citas_FechaHora] ON [dbo].[Citas]
(
	[FechaHora] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_Citas_MascotaId]
/****** Object:  Index [IX_Citas_MascotaId]    Script Date: 7/12/2026 5:22:06 PM ******/
CREATE NONCLUSTERED INDEX [IX_Citas_MascotaId] ON [dbo].[Citas]
(
	[MascotaId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_Citas_VeterinarioId]
/****** Object:  Index [IX_Citas_VeterinarioId]    Script Date: 7/12/2026 5:22:06 PM ******/
CREATE NONCLUSTERED INDEX [IX_Citas_VeterinarioId] ON [dbo].[Citas]
(
	[VeterinarioId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [UX_Clientes_Correo]
SET ANSI_PADDING ON
GO
/****** Object:  Index [UX_Clientes_Correo]    Script Date: 7/12/2026 5:22:06 PM ******/
CREATE UNIQUE NONCLUSTERED INDEX [UX_Clientes_Correo] ON [dbo].[Clientes]
(
	[Correo] ASC
)
WHERE ([Correo] IS NOT NULL)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_HistorialMedico_MascotaId]
/****** Object:  Index [IX_HistorialMedico_MascotaId]    Script Date: 7/12/2026 5:22:06 PM ******/
CREATE NONCLUSTERED INDEX [IX_HistorialMedico_MascotaId] ON [dbo].[HistorialMedico]
(
	[MascotaId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_HistProd_HistorialId]
/****** Object:  Index [IX_HistProd_HistorialId]    Script Date: 7/12/2026 5:22:06 PM ******/
CREATE NONCLUSTERED INDEX [IX_HistProd_HistorialId] ON [dbo].[HistorialProductos]
(
	[HistorialId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_HistProd_ProductoId]
/****** Object:  Index [IX_HistProd_ProductoId]    Script Date: 7/12/2026 5:22:06 PM ******/
CREATE NONCLUSTERED INDEX [IX_HistProd_ProductoId] ON [dbo].[HistorialProductos]
(
	[ProductoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_Hospedajes_EspacioId]
/****** Object:  Index [IX_Hospedajes_EspacioId]    Script Date: 7/12/2026 5:22:06 PM ******/
CREATE NONCLUSTERED INDEX [IX_Hospedajes_EspacioId] ON [dbo].[Hospedajes]
(
	[EspacioId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_Hospedajes_MascotaId]
/****** Object:  Index [IX_Hospedajes_MascotaId]    Script Date: 7/12/2026 5:22:06 PM ******/
CREATE NONCLUSTERED INDEX [IX_Hospedajes_MascotaId] ON [dbo].[Hospedajes]
(
	[MascotaId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_Mascotas_ClienteId]
/****** Object:  Index [IX_Mascotas_ClienteId]    Script Date: 7/12/2026 5:22:06 PM ******/
CREATE NONCLUSTERED INDEX [IX_Mascotas_ClienteId] ON [dbo].[Mascotas]
(
	[ClienteId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_Movimientos_ProductoId]
/****** Object:  Index [IX_Movimientos_ProductoId]    Script Date: 7/12/2026 5:22:06 PM ******/
CREATE NONCLUSTERED INDEX [IX_Movimientos_ProductoId] ON [dbo].[MovimientosInventario]
(
	[ProductoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_Notificaciones_EstadoEnvio]
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Notificaciones_EstadoEnvio]    Script Date: 7/12/2026 5:22:06 PM ******/
CREATE NONCLUSTERED INDEX [IX_Notificaciones_EstadoEnvio] ON [dbo].[NotificacionesEmail]
(
	[EstadoEnvio] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_Usuarios_RolId]
/****** Object:  Index [IX_Usuarios_RolId]    Script Date: 7/12/2026 5:22:06 PM ******/
CREATE NONCLUSTERED INDEX [IX_Usuarios_RolId] ON [dbo].[Usuarios]
(
	[RolId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [UX_Usuarios_Correo]
SET ANSI_PADDING ON
GO
/****** Object:  Index [UX_Usuarios_Correo]    Script Date: 7/12/2026 5:22:06 PM ******/
CREATE UNIQUE NONCLUSTERED INDEX [UX_Usuarios_Correo] ON [dbo].[Usuarios]
(
	[Correo] ASC
)
WHERE ([Correo] IS NOT NULL)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_VacunasMascotas_FechaProximaDosis]
/****** Object:  Index [IX_VacunasMascotas_FechaProximaDosis]    Script Date: 7/12/2026 5:22:06 PM ******/
CREATE NONCLUSTERED INDEX [IX_VacunasMascotas_FechaProximaDosis] ON [dbo].[VacunasMascotas]
(
	[FechaProximaDosis] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_VacunasMascotas_MascotaId]
/****** Object:  Index [IX_VacunasMascotas_MascotaId]    Script Date: 7/12/2026 5:22:06 PM ******/
CREATE NONCLUSTERED INDEX [IX_VacunasMascotas_MascotaId] ON [dbo].[VacunasMascotas]
(
	[MascotaId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [IX_VacunasMascotas_ProductoId]
/****** Object:  Index [IX_VacunasMascotas_ProductoId]    Script Date: 7/12/2026 5:22:06 PM ******/
CREATE NONCLUSTERED INDEX [IX_VacunasMascotas_ProductoId] ON [dbo].[VacunasMascotas]
(
	[ProductoId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

# [DF__Citas__EstadoCit__619B8048]
ALTER TABLE [dbo].[Citas] ADD  DEFAULT ((1)) FOR [EstadoCitaId]
GO

# [DF__Citas__FechaCrea__628FA481]
ALTER TABLE [dbo].[Citas] ADD  DEFAULT (getdate()) FOR [FechaCreacion]
GO

# [DF__Clientes__Estado__5535A963]
ALTER TABLE [dbo].[Clientes] ADD  DEFAULT ((1)) FOR [Estado]
GO

# [DF__Clientes__FechaR__5629CD9C]
ALTER TABLE [dbo].[Clientes] ADD  DEFAULT (getdate()) FOR [FechaRegistro]
GO

# [DF__EspaciosH__Estad__7D439ABD]
ALTER TABLE [dbo].[EspaciosHotel] ADD  DEFAULT ('Disponible') FOR [Estado]
GO

# [DF__Historial__Fecha__693CA210]
ALTER TABLE [dbo].[HistorialMedico] ADD  DEFAULT (getdate()) FOR [FechaConsulta]
GO

# [DF__Hospedaje__Estad__01142BA1]
ALTER TABLE [dbo].[Hospedajes] ADD  DEFAULT ('Activo') FOR [Estado]
GO

# [DF__Mascotas__Estado__59FA5E80]
ALTER TABLE [dbo].[Mascotas] ADD  DEFAULT ((1)) FOR [Estado]
GO

# [DF__Mascotas__FechaR__5AEE82B9]
ALTER TABLE [dbo].[Mascotas] ADD  DEFAULT (getdate()) FOR [FechaRegistro]
GO

# [DF__Movimient__Fecha__0E6E26BF]
ALTER TABLE [dbo].[MovimientosInventario] ADD  DEFAULT (getdate()) FOR [FechaMovimiento]
GO

# [DF__Notificac__Estad__73BA3083]
ALTER TABLE [dbo].[NotificacionesEmail] ADD  DEFAULT ('Pendiente') FOR [EstadoEnvio]
GO

# [DF__Productos__Canti__07C12930]
ALTER TABLE [dbo].[Productos] ADD  DEFAULT ((0)) FOR [CantidadActual]
GO

# [DF__Productos__Nivel__08B54D69]
ALTER TABLE [dbo].[Productos] ADD  DEFAULT ((0)) FOR [NivelMinimo]
GO

# [DF__Productos__Estad__09A971A2]
ALTER TABLE [dbo].[Productos] ADD  DEFAULT ((1)) FOR [Estado]
GO

# [DF__Productos__Fecha__0A9D95DB]
ALTER TABLE [dbo].[Productos] ADD  DEFAULT (getdate()) FOR [FechaRegistro]
GO

# [DF__Productos__Categ__3A4CA8FD]
ALTER TABLE [dbo].[Productos] ADD  DEFAULT ('General') FOR [Categoria]
GO

# [DF__Usuarios__Estado__4F7CD00D]
ALTER TABLE [dbo].[Usuarios] ADD  DEFAULT ((1)) FOR [Estado]
GO

# [DF__Usuarios__FechaC__5070F446]
ALTER TABLE [dbo].[Usuarios] ADD  DEFAULT (getdate()) FOR [FechaCreacion]
GO

# [FK_Citas_Estados]
ALTER TABLE [dbo].[Citas]  WITH CHECK ADD  CONSTRAINT [FK_Citas_Estados] FOREIGN KEY([EstadoCitaId])
REFERENCES [dbo].[EstadosCita] ([EstadoCitaId])
GO
ALTER TABLE [dbo].[Citas] CHECK CONSTRAINT [FK_Citas_Estados]
GO

# [FK_Citas_Mascotas]
ALTER TABLE [dbo].[Citas]  WITH CHECK ADD  CONSTRAINT [FK_Citas_Mascotas] FOREIGN KEY([MascotaId])
REFERENCES [dbo].[Mascotas] ([MascotaId])
GO
ALTER TABLE [dbo].[Citas] CHECK CONSTRAINT [FK_Citas_Mascotas]
GO

# [FK_Citas_Veterinario]
ALTER TABLE [dbo].[Citas]  WITH CHECK ADD  CONSTRAINT [FK_Citas_Veterinario] FOREIGN KEY([VeterinarioId])
REFERENCES [dbo].[Usuarios] ([UsuarioId])
GO
ALTER TABLE [dbo].[Citas] CHECK CONSTRAINT [FK_Citas_Veterinario]
GO

# [FK_Historial_Citas]
ALTER TABLE [dbo].[HistorialMedico]  WITH CHECK ADD  CONSTRAINT [FK_Historial_Citas] FOREIGN KEY([CitaId])
REFERENCES [dbo].[Citas] ([CitaId])
GO
ALTER TABLE [dbo].[HistorialMedico] CHECK CONSTRAINT [FK_Historial_Citas]
GO

# [FK_Historial_Mascotas]
ALTER TABLE [dbo].[HistorialMedico]  WITH CHECK ADD  CONSTRAINT [FK_Historial_Mascotas] FOREIGN KEY([MascotaId])
REFERENCES [dbo].[Mascotas] ([MascotaId])
GO
ALTER TABLE [dbo].[HistorialMedico] CHECK CONSTRAINT [FK_Historial_Mascotas]
GO

# [FK_Historial_Veterinario]
ALTER TABLE [dbo].[HistorialMedico]  WITH CHECK ADD  CONSTRAINT [FK_Historial_Veterinario] FOREIGN KEY([VeterinarioId])
REFERENCES [dbo].[Usuarios] ([UsuarioId])
GO
ALTER TABLE [dbo].[HistorialMedico] CHECK CONSTRAINT [FK_Historial_Veterinario]
GO

# [FK_HistProd_Historial]
ALTER TABLE [dbo].[HistorialProductos]  WITH CHECK ADD  CONSTRAINT [FK_HistProd_Historial] FOREIGN KEY([HistorialId])
REFERENCES [dbo].[HistorialMedico] ([HistorialId])
GO
ALTER TABLE [dbo].[HistorialProductos] CHECK CONSTRAINT [FK_HistProd_Historial]
GO

# [FK_HistProd_Productos]
ALTER TABLE [dbo].[HistorialProductos]  WITH CHECK ADD  CONSTRAINT [FK_HistProd_Productos] FOREIGN KEY([ProductoId])
REFERENCES [dbo].[Productos] ([ProductoId])
GO
ALTER TABLE [dbo].[HistorialProductos] CHECK CONSTRAINT [FK_HistProd_Productos]
GO

# [FK_Hospedajes_Espacios]
ALTER TABLE [dbo].[Hospedajes]  WITH CHECK ADD  CONSTRAINT [FK_Hospedajes_Espacios] FOREIGN KEY([EspacioId])
REFERENCES [dbo].[EspaciosHotel] ([EspacioId])
GO
ALTER TABLE [dbo].[Hospedajes] CHECK CONSTRAINT [FK_Hospedajes_Espacios]
GO

# [FK_Hospedajes_Mascotas]
ALTER TABLE [dbo].[Hospedajes]  WITH CHECK ADD  CONSTRAINT [FK_Hospedajes_Mascotas] FOREIGN KEY([MascotaId])
REFERENCES [dbo].[Mascotas] ([MascotaId])
GO
ALTER TABLE [dbo].[Hospedajes] CHECK CONSTRAINT [FK_Hospedajes_Mascotas]
GO

# [FK_Mascotas_Clientes]
ALTER TABLE [dbo].[Mascotas]  WITH CHECK ADD  CONSTRAINT [FK_Mascotas_Clientes] FOREIGN KEY([ClienteId])
REFERENCES [dbo].[Clientes] ([ClienteId])
GO
ALTER TABLE [dbo].[Mascotas] CHECK CONSTRAINT [FK_Mascotas_Clientes]
GO

# [FK_Movimientos_Productos]
ALTER TABLE [dbo].[MovimientosInventario]  WITH CHECK ADD  CONSTRAINT [FK_Movimientos_Productos] FOREIGN KEY([ProductoId])
REFERENCES [dbo].[Productos] ([ProductoId])
GO
ALTER TABLE [dbo].[MovimientosInventario] CHECK CONSTRAINT [FK_Movimientos_Productos]
GO

# [FK_Movimientos_Usuarios]
ALTER TABLE [dbo].[MovimientosInventario]  WITH CHECK ADD  CONSTRAINT [FK_Movimientos_Usuarios] FOREIGN KEY([UsuarioId])
REFERENCES [dbo].[Usuarios] ([UsuarioId])
GO
ALTER TABLE [dbo].[MovimientosInventario] CHECK CONSTRAINT [FK_Movimientos_Usuarios]
GO

# [FK_Notificaciones_Citas]
ALTER TABLE [dbo].[NotificacionesEmail]  WITH CHECK ADD  CONSTRAINT [FK_Notificaciones_Citas] FOREIGN KEY([CitaId])
REFERENCES [dbo].[Citas] ([CitaId])
GO
ALTER TABLE [dbo].[NotificacionesEmail] CHECK CONSTRAINT [FK_Notificaciones_Citas]
GO

# [FK_Notificaciones_Clientes]
ALTER TABLE [dbo].[NotificacionesEmail]  WITH CHECK ADD  CONSTRAINT [FK_Notificaciones_Clientes] FOREIGN KEY([ClienteId])
REFERENCES [dbo].[Clientes] ([ClienteId])
GO
ALTER TABLE [dbo].[NotificacionesEmail] CHECK CONSTRAINT [FK_Notificaciones_Clientes]
GO

# [FK_Notificaciones_Mascotas]
ALTER TABLE [dbo].[NotificacionesEmail]  WITH CHECK ADD  CONSTRAINT [FK_Notificaciones_Mascotas] FOREIGN KEY([MascotaId])
REFERENCES [dbo].[Mascotas] ([MascotaId])
GO
ALTER TABLE [dbo].[NotificacionesEmail] CHECK CONSTRAINT [FK_Notificaciones_Mascotas]
GO

# [FK_Notificaciones_Vacunas]
ALTER TABLE [dbo].[NotificacionesEmail]  WITH CHECK ADD  CONSTRAINT [FK_Notificaciones_Vacunas] FOREIGN KEY([VacunaId])
REFERENCES [dbo].[VacunasMascotas] ([VacunaId])
GO
ALTER TABLE [dbo].[NotificacionesEmail] CHECK CONSTRAINT [FK_Notificaciones_Vacunas]
GO

# [FK_Usuarios_Roles]
ALTER TABLE [dbo].[Usuarios]  WITH CHECK ADD  CONSTRAINT [FK_Usuarios_Roles] FOREIGN KEY([RolId])
REFERENCES [dbo].[Roles] ([RolId])
GO
ALTER TABLE [dbo].[Usuarios] CHECK CONSTRAINT [FK_Usuarios_Roles]
GO

# [FK_Vacunas_Mascotas]
ALTER TABLE [dbo].[VacunasMascotas]  WITH CHECK ADD  CONSTRAINT [FK_Vacunas_Mascotas] FOREIGN KEY([MascotaId])
REFERENCES [dbo].[Mascotas] ([MascotaId])
GO
ALTER TABLE [dbo].[VacunasMascotas] CHECK CONSTRAINT [FK_Vacunas_Mascotas]
GO

# [FK_Vacunas_Productos]
ALTER TABLE [dbo].[VacunasMascotas]  WITH CHECK ADD  CONSTRAINT [FK_Vacunas_Productos] FOREIGN KEY([ProductoId])
REFERENCES [dbo].[Productos] ([ProductoId])
GO
ALTER TABLE [dbo].[VacunasMascotas] CHECK CONSTRAINT [FK_Vacunas_Productos]
GO

# [FK_Vacunas_Veterinario]
ALTER TABLE [dbo].[VacunasMascotas]  WITH CHECK ADD  CONSTRAINT [FK_Vacunas_Veterinario] FOREIGN KEY([VeterinarioId])
REFERENCES [dbo].[Usuarios] ([UsuarioId])
GO
ALTER TABLE [dbo].[VacunasMascotas] CHECK CONSTRAINT [FK_Vacunas_Veterinario]
GO

# [CK__Clientes__Telefo__5441852A]
ALTER TABLE [dbo].[Clientes]  WITH CHECK ADD CHECK  ((NOT [Telefono] like '%[a-zA-Z]%'))
GO

# [CK__EspaciosH__Estad__7E37BEF6]
ALTER TABLE [dbo].[EspaciosHotel]  WITH CHECK ADD CHECK  (([Estado]='Mantenimiento' OR [Estado]='Ocupado' OR [Estado]='Disponible'))
GO

# [CK__EspaciosHo__Tipo__7C4F7684]
ALTER TABLE [dbo].[EspaciosHotel]  WITH CHECK ADD CHECK  (([Tipo]='Grande' OR [Tipo]='Mediano' OR [Tipo]='Pequeño'))
GO

# [CK__Historial__Canti__2A164134]
ALTER TABLE [dbo].[HistorialProductos]  WITH CHECK ADD CHECK  (([Cantidad]>(0)))
GO

# [CK__Hospedaje__Estad__02084FDA]
ALTER TABLE [dbo].[Hospedajes]  WITH CHECK ADD CHECK  (([Estado]='Cancelado' OR [Estado]='Completado' OR [Estado]='Activo'))
GO

# [CK__Mascotas__Sexo__59063A47]
ALTER TABLE [dbo].[Mascotas]  WITH CHECK ADD CHECK  (([Sexo]='H' OR [Sexo]='M'))
GO

# [CK__Movimient__TipoM__0D7A0286]
ALTER TABLE [dbo].[MovimientosInventario]  WITH CHECK ADD CHECK  (([TipoMovimiento]='Ajuste' OR [TipoMovimiento]='Salida' OR [TipoMovimiento]='Entrada'))
GO

# [CK__Notificac__Estad__74AE54BC]
ALTER TABLE [dbo].[NotificacionesEmail]  WITH CHECK ADD CHECK  (([EstadoEnvio]='Fallido' OR [EstadoEnvio]='Enviado' OR [EstadoEnvio]='Pendiente'))
GO

# [CK__Notificac__TipoN__72C60C4A]
ALTER TABLE [dbo].[NotificacionesEmail]  WITH CHECK ADD CHECK  (([TipoNotificacion]='RecogidaHotel' OR [TipoNotificacion]='VencimientoVacuna' OR [TipoNotificacion]='ConfirmacionCita' OR [TipoNotificacion]='RecordatorioCita'))
GO

# [CHK_CantidadActual_NoNegativo]
ALTER TABLE [dbo].[Productos]  WITH CHECK ADD  CONSTRAINT [CHK_CantidadActual_NoNegativo] CHECK  (([CantidadActual]>=(0)))
GO
ALTER TABLE [dbo].[Productos] CHECK CONSTRAINT [CHK_CantidadActual_NoNegativo]
GO

# [CHK_NivelMinimo_NoNegativo]
ALTER TABLE [dbo].[Productos]  WITH CHECK ADD  CONSTRAINT [CHK_NivelMinimo_NoNegativo] CHECK  (([NivelMinimo]>=(0)))
GO
ALTER TABLE [dbo].[Productos] CHECK CONSTRAINT [CHK_NivelMinimo_NoNegativo]
GO

# [CK__Usuarios__Passwo__4E88ABD4]
ALTER TABLE [dbo].[Usuarios]  WITH CHECK ADD CHECK  ((len([PasswordHash])>=(8)))
GO

# [VetManagerPro]
USE [master]
GO

ALTER DATABASE [VetManagerPro] SET  READ_WRITE 
GO
