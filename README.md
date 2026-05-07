# EcoEduca - Sistema de Educación Ambiental

## Descripción

EcoEduca es una plataforma educativa ambiental enfocada en la región del Catatumbo, Colombia. El sistema permite a los usuarios registrarse, acceder a contenido educativo y realizar evaluaciones sobre prácticas ambientales.

## Características

- 🌱 Sistema de registro y autenticación de usuarios
- 📚 Contenido educativo sobre medio ambiente
- 📊 Sistema de evaluación de prácticas ambientales
- 🎨 Diseño responsive y moderno
- 🔐 Seguridad con JWT y encriptación de contraseñas
- 📱 Interfaz móvil optimizada

## Tecnologías

### Frontend
- HTML5
- CSS3 con Poppins y diseño responsive
- JavaScript vanilla
- Validación de formularios en tiempo real

### Backend
- Node.js
- Express.js
- MySQL con mysql2
- JWT para autenticación
- bcryptjs para encriptación
- express-validator para validación

## Instalación

### Prerrequisitos
- Node.js (v14 o superior)
- MySQL (v5.7 o superior)
- Git

### 1. Clonar el repositorio
```bash
git clone <repositorio-url>
cd EcoEduca
```

### 2. Instalar dependencias del backend
```bash
npm install
```

### 3. Configurar la base de datos

#### Opción A: Usar el script SQL
```bash
mysql -u root -p < database_setup.sql
```

#### Opción B: Configuración manual
1. Crear la base de datos:
```sql
CREATE DATABASE ecoeduca;
```

2. Importar el script `database_setup.sql`

### 4. Configurar variables de entorno

Copia el archivo `.env` y ajusta las configuraciones:
```env
# Configuración del servidor
PORT=3000
NODE_ENV=development

# Configuración de la base de datos MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=ecoeduca

# Configuración JWT
JWT_SECRET=tu_secreto_super_seguro_aqui
JWT_EXPIRES_IN=24h

# Configuración CORS
FRONTEND_URL=http://localhost:5500
```

### 5. Iniciar el servidor

#### Modo desarrollo:
```bash
npm run dev
```

#### Modo producción:
```bash
npm start
```

### 6. Acceder a la aplicación

- Frontend: Abre `index.html` en tu navegador o usa un servidor local
- API: `http://localhost:3000/api`
- Documentación de endpoints: Ver sección de API

## Estructura del Proyecto

```
EcoEduca/
├── css/
│   ├── normalize.css
│   ├── style.css
│   └── auth.css
├── html/
│   ├── index.html
│   ├── login.html
│   ├── registro.html
│   ├── subpagina.html
│   └── subpagina2.html
├── js/
│   ├── api.js
│   ├── auth.js
│   ├── slider.js
│   └── questions.js
├── icons/
│   ├── eye.svg
│   ├── eye-off.svg
│   ├── google.svg
│   └── ...
├── images/
├── video/
├── config/
│   └── database.js
├── routes/
│   ├── auth.js
│   └── users.js
├── package.json
├── server.js
├── database_setup.sql
└── README.md
```

## API Endpoints

### Autenticación

#### POST `/api/auth/register`
Registrar un nuevo usuario
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@email.com",
  "telefono": "+57 300 123 4567",
  "password": "Password123",
  "terms": true
}
```

#### POST `/api/auth/login`
Iniciar sesión
```json
{
  "email": "juan@email.com",
  "password": "Password123",
  "remember": false
}
```

#### POST `/api/auth/logout`
Cerrar sesión (requiere token)

#### GET `/api/auth/verify`
Verificar token (requiere token)

#### POST `/api/auth/forgot-password`
Recuperar contraseña
```json
{
  "email": "juan@email.com"
}
```

### Usuarios

#### GET `/api/users/profile`
Obtener perfil del usuario (requiere token)

#### PUT `/api/users/profile`
Actualizar perfil del usuario (requiere token)

#### PUT `/api/users/password`
Cambiar contraseña (requiere token)

#### GET `/api/users/sessions`
Obtener sesiones activas (requiere token)

#### DELETE `/api/users/sessions/:sessionId`
Cerrar sesión específica (requiere token)

#### DELETE `/api/users/account`
Eliminar cuenta de usuario (requiere token)

## Usuarios por Defecto

El sistema crea un usuario administrador por defecto:
- **Email**: admin@ecoeduca.com
- **Contraseña**: Admin123!
- **Rol**: admin

⚠️ **Importante**: Cambia esta contraseña en producción

## Desarrollo

### Scripts disponibles
- `npm start` - Inicia servidor en modo producción
- `npm run dev` - Inicia servidor con nodemon
- `npm test` - Ejecuta pruebas (cuando se implementen)

### Variables de entorno
- `NODE_ENV` - Entorno (development/production)
- `PORT` - Puerto del servidor
- `DB_HOST` - Host de la base de datos
- `DB_USER` - Usuario de la base de datos
- `DB_PASSWORD` - Contraseña de la base de datos
- `DB_NAME` - Nombre de la base de datos
- `JWT_SECRET` - Secreto para tokens JWT
- `JWT_EXPIRES_IN` - Tiempo de expiración de tokens
- `FRONTEND_URL` - URL del frontend para CORS

## Seguridad

- ✅ Encriptación de contraseñas con bcrypt (12 rounds)
- ✅ Tokens JWT con expiración configurable
- ✅ Validación de entrada de datos
- ✅ Protección contra ataques CSRF
- ✅ Rate limiting en peticiones
- ✅ Helmet para seguridad de headers
- ✅ CORS configurado

## Contribución

1. Fork del proyecto
2. Crear rama de características (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para detalles.

## Soporte

Para soporte o preguntas, contacta a:
- Email: soporte@ecoeduca.com
- GitHub Issues: [Crear issue en el repositorio]

## Créditos

Desarrollado por:
- Johan Cárdenas
- Duvan Carvajalino

Proyecto educativo para la región del Catatumbo, Colombia.
