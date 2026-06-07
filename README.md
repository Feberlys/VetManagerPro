# VetManager Pro - MVP

Sistema de Gestión para Clínicas Veterinarias. 

## 👥 Asignación de Módulos (Equipo 2)

* **Feberlys Batista (Tech Lead):** M1 (Acceso y Usuarios) + Arquitectura y BD.
* **Miguel Guerrero:** M2 (Clientes y Mascotas) + M3 (Citas y Agenda).
* **Eduardo Beato:** M4 (Historial Médico).
* **Albert Garcia:** M6 (Hotel / Guardería).
* **Erick Perez:** M7 (Inventario de Productos) + M5 (Notificaciones).

---

## ⚙️ Reglas de Control de Versiones (Git)

**PROHIBIDO TRABAJAR DIRECTAMENTE EN LA RAMA `main`.** Cada desarrollador debe crear una rama independiente para su módulo y luego hacer un Pull Request.

### Paso 1: Clonar el proyecto (Solo la primera vez)
Abre la terminal en la carpeta donde quieres guardar el proyecto y ejecuta:
\`\`\`bash
git clone https://github.com/Feberlys/VetManagerPro.git
cd VetManagerPro
\`\`\`

### Paso 2: Crear tu rama de trabajo
Antes de escribir cualquier línea de código, crea la rama de tu módulo:
\`\`\`bash
git checkout -b modulo-tunombre
\`\`\`
*(Ejemplo: `git checkout -b modulo-miguel-citas`)*

### Paso 3: Guardar y subir tus cambios
Cuando termines una parte funcional de tu código, súbela a GitHub con estos tres comandos:
\`\`\`bash
git add .
git commit -m "Descripción clara de lo que hiciste"
git push origin modulo-tunombre
\`\`\`

### Paso 4: Unir tu código al proyecto principal
1. Entra a GitHub.
2. Verás un botón verde que dice **"Compare & pull request"**. Dale clic.
3. Feberlys revisará el código y aceptará la fusión a `main`.

### Paso 5: Actualizar tu código local
Antes de empezar a trabajar al día siguiente, asegúrate de tener los cambios de los demás:
\`\`\`bash
git checkout main
git pull origin main
git checkout modulo-tunombre
\`\`\`



# M6 - Módulo de Guardería

## Integrante

* Albert García

## Requisitos Funcionales Implementados

### RF-22 - Gestión de espacios

* Registro de espacios disponibles del hotel.
* Datos registrados:

  * Número de espacio.
  * Tipo (Pequeño, Mediano, Grande).
  * Precio por noche.
* Acceso exclusivo para Administradores.

### RF-23 - Check-in de mascotas

* Registro de hospedaje de mascotas.
* Selección de espacio disponible.
* Registro de fecha de entrada.
* Registro de fecha estimada de salida.
* Registro de notas especiales:

  * Dieta.
  * Medicación.
  * Alergias.
  * Observaciones.

### RF-24 - Check-out de mascotas

* Registro de salida de la mascota.
* Cálculo automático del total a pagar según las noches de hospedaje.
* Liberación automática del espacio ocupado.

### RF-25 - Consulta de ocupación

* Visualización de espacios ocupados.
* Información mostrada:

  * Mascota hospedada.
  * Cliente propietario.
  * Espacio asignado.
  * Fecha de entrada.
  * Fecha estimada de salida.
  * Notas especiales.

### RF-26 - Notificación por correo electrónico

* Envío automático de correo al propietario al realizar el check-out.
* El correo informa que la mascota está lista para ser recogida.
* Incluye el monto total a pagar.

## Roles involucrados

### Administrador

* Registrar espacios.
* Consultar ocupación.
* Realizar check-in.
* Realizar check-out.

### Recepcionista

* Consultar ocupación.
* Realizar check-in.
* Realizar check-out.
* No puede registrar espacios.

## Dependencias agregadas

Backend:

```bash
npm install nodemailer
```

## Variables de entorno requeridas

```env
EMAIL_USER=correo@gmail.com
EMAIL_PASS=contraseña_de_aplicacion
```

## Base de datos utilizada

Tablas:

* EspaciosHotel
* Hospedajes

## Estado del módulo

M6 Guardería completado y funcional.
