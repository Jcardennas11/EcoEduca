# Instrucciones para subir EcoEduca a GitHub

## 🚀 Preparación completada

Ya he preparado todo el proyecto para subir al repositorio:

### ✅ Archivos creados/configurados:
- `.gitignore` - Archivo de exclusiones para Git
- Estructura completa del proyecto con Firebase
- Sistema de autenticación funcional
- Diseño minimalista mejorado

## 📋 Pasos para subir a GitHub:

### 1. Abrir terminal o PowerShell
```bash
# Navegar al directorio del proyecto
cd C:\Users\SCIM-PC01\Downloads\EcoEduca

# Inicializar repositorio Git
git init

# Agregar todos los archivos
git add .

# Hacer primer commit
git commit -m "Inicializar proyecto EcoEduca con Firebase Authentication"

# Conectar con GitHub (reemplaza con tus datos)
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git

# Subir al repositorio
git push -u origin main
```

### 2. Si no tienes Git instalado:
1. **Descargar Git**: https://git-scm.com/download/win
2. **Instalar Git** con las opciones por defecto
3. **Reiniciar terminal** y repetir los comandos

### 3. Crear repositorio en GitHub:
1. Ir a https://github.com
2. Click en "New repository"
3. Nombre: `EcoEduca`
4. Descripción: `Sistema de educación ambiental con Firebase Authentication`
5. Marcar como "Public" o "Private" según prefieras
6. Click en "Create repository"

## 📁 Estructura del proyecto:

```
EcoEduca/
├── css/
│   ├── auth.css              # Estilos de autenticación
│   ├── firebase.css           # Estilos de Firebase
│   ├── normalize.css
│   └── style.css
├── html/
│   ├── login.html            # Página de login
│   ├── registro.html          # Página de registro
│   ├── subpagina.html
│   └── subpagina2.html
├── js/
│   ├── firebase-auth.js       # Autenticación con Firebase
│   ├── firebase-config.js     # Configuración de Firebase
│   ├── firebase-user.js      # Gestión de usuarios
│   ├── api.js               # Cliente API (alternativo)
│   ├── auth.js              # Validación de formularios
│   ├── slider.js
│   └── questions.js
├── icons/                   # Iconos SVG
├── images/                  # Imágenes del proyecto
├── video/                   # Videos educativos
├── package.json             # Dependencias del backend
├── server.js                # Servidor Node.js
├── database_setup.sql        # Script de base de datos
├── .gitignore              # Exclusiones de Git
├── README.md               # Documentación del proyecto
└── index.html              # Página principal
```

## 🔥 Características implementadas:

- ✅ Firebase Authentication (email/contraseña y Google)
- ✅ Firestore para base de datos
- ✅ Diseño responsive y minimalista
- ✅ Validación de formularios en tiempo real
- ✅ Área de usuario con nombre real
- ✅ Sistema de logout funcional
- ✅ Backend Node.js con Express (alternativo)
- ✅ Base de datos MySQL (alternativo)

## 🎨 Diseño final:

- **Área de usuario**: Fondo transparente, letras blancas, borde verde
- **Avatar**: Gradiente verde con iniciales automáticas
- **Botón logout**: Rojo minimalista con hover sutil
- **Responsive**: Adaptado a móviles y tablets

## 🌱 Temática ambiental:

- Colores verdes que evocan naturaleza
- Diseño limpio y minimalista
- Iconos y elementos sutiles
- Experiencia de usuario fluida

---

**¡Listo para subir a GitHub!** 🚀

El proyecto está completamente funcional y listo para producción.
