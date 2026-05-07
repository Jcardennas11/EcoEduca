// Gestión de usuarios con Firebase
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si estamos en una página que requiere autenticación
    const requiresAuth = !window.location.pathname.includes('login.html') && 
                       !window.location.pathname.includes('registro.html');

    // Función para verificar si el usuario está autenticado
    function checkAuthStatus() {
        return new Promise((resolve) => {
            window.firebaseFunctions.onAuthStateChanged((user) => {
                if (user) {
                    // Usuario autenticado
                    resolve({ authenticated: true, user });
                } else {
                    // Usuario no autenticado
                    resolve({ authenticated: false, user: null });
                }
            });
        });
    }

    // Función para actualizar la UI según el estado de autenticación
    function updateUI(user) {
        // Actualizar navegación
        updateNavigation(user);
        
        // Si estamos en una página que requiere autenticación y no hay usuario
        if (requiresAuth && !user) {
            window.location.href = 'html/login.html';
            return;
        }
    }

    // Actualizar navegación principal
    function updateNavigation(user) {
        const navLinks = document.querySelector('.nav_link');
        if (!navLinks) return;

        if (user) {
            // Usuario autenticado - mostrar área de usuario
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            
            // Mostrar área de usuario
            const userArea = document.getElementById('user-area');
            const authLinks = document.querySelectorAll('.auth-links');
            
            if (userArea) {
                userArea.style.display = 'block';
                
                // Actualizar información del usuario
                const displayName = document.getElementById('user-display-name');
                const displayEmail = document.getElementById('user-display-email');
                const avatarImg = document.getElementById('user-avatar-img');
                
                // Prioridad: userData.nombre > user.displayName > 'Usuario'
                const userName = userData.nombre || user.displayName || 'Usuario';
                
                if (displayName) {
                    displayName.textContent = userName;
                }
                
                if (displayEmail) {
                    displayEmail.textContent = user.email || userData.email || 'email@example.com';
                }
                
                if (avatarImg) {
                    // Usar foto de Google si está disponible, sino una imagen por defecto
                    if (user.photoURL) {
                        avatarImg.src = user.photoURL;
                    } else {
                        // Generar avatar con iniciales
                        const initials = getInitials(userName);
                        avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=0e681b&color=fff&size=40`;
                    }
                }
            }
            
            // Ocultar enlaces de login/registro
            authLinks.forEach(link => {
                link.style.display = 'none';
            });
            
            // Agregar event listener para logout
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.removeEventListener('click', handleLogout);
                logoutBtn.addEventListener('click', handleLogout);
            }
            
        } else {
            // Usuario no autenticado - mostrar enlaces de login/registro
            const userArea = document.getElementById('user-area');
            const authLinks = document.querySelectorAll('.auth-links');
            
            if (userArea) {
                userArea.style.display = 'none';
            }
            
            authLinks.forEach(link => {
                link.style.display = 'block';
            });
        }
    }

    // Función para obtener iniciales del nombre
    function getInitials(name) {
        if (!name) return 'U';
        
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        } else {
            return name.substring(0, 2).toUpperCase();
        }
    }

    // Manejar logout
    async function handleLogout(e) {
        e.preventDefault();
        
        try {
            const result = await window.firebaseFunctions.signOut();
            
            if (result.success) {
                // Limpiar datos locales
                localStorage.removeItem('userData');
                localStorage.removeItem('rememberEmail');
                
                // Mostrar mensaje
                showMessage('Sesión cerrada exitosamente', 'success');
                
                // Redirigir al login
                setTimeout(() => {
                    window.location.href = 'html/login.html';
                }, 1000);
            } else {
                showMessage(result.error, 'error');
            }
        } catch (error) {
            console.error('Error en logout:', error);
            showMessage('Error al cerrar sesión', 'error');
        }
    }

    // Mostrar perfil
    function showProfile(e) {
        e.preventDefault();
        // Aquí podrías mostrar un modal o redirigir a una página de perfil
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        showMessage(`Perfil: ${userData.nombre} ${userData.apellido || ''}`, 'info');
    }

    // Mostrar configuración
    function showSettings(e) {
        e.preventDefault();
        // Aquí podrías mostrar un modal de configuración
        showMessage('Configuración (próximamente)', 'info');
    }

    // Función para mostrar mensajes (reutilizada de auth.js)
    function showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        if (type === 'success') {
            messageDiv.style.background = '#27ae60';
        } else if (type === 'error') {
            messageDiv.style.background = '#e74c3c';
        } else {
            messageDiv.style.background = '#3498db';
        }
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }

    // Inicializar verificación de autenticación
    async function init() {
        try {
            const authStatus = await checkAuthStatus();
            
            // Depuración: mostrar datos del usuario y localStorage
            console.log('Estado de autenticación:', authStatus);
            console.log('Datos en localStorage:', localStorage.getItem('userData'));
            
            updateUI(authStatus.user);
        } catch (error) {
            console.error('Error verificando autenticación:', error);
            updateUI(null);
        }
    }

    // Iniciar solo si Firebase está disponible
    if (window.firebaseFunctions) {
        init();
    } else {
        // Esperar a que Firebase cargue
        setTimeout(() => {
            if (window.firebaseFunctions) {
                init();
            }
        }, 1000);
    }
});
