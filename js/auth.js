// Funcionalidad de autenticación
document.addEventListener('DOMContentLoaded', function() {
    // Determinar si estamos en login o registro
    const isLoginPage = window.location.pathname.includes('login.html');
    const isRegisterPage = window.location.pathname.includes('registro.html');

    // Toggle de visibilidad de contraseña
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const icon = this.querySelector('img');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.src = '../icons/eye-off.svg';
            } else {
                input.type = 'password';
                icon.src = '../icons/eye.svg';
            }
        });
    });

    // Validación de email
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validación de contraseña
    function validatePassword(password) {
        return password.length >= 8;
    }

    // Validación de teléfono
    function validatePhone(phone) {
        if (!phone) return true; // Es opcional
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        return phoneRegex.test(phone);
    }

    // Calcular fuerza de contraseña
    function calculatePasswordStrength(password) {
        let strength = 0;
        
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;
        
        return strength;
    }

    // Mostrar fuerza de contraseña
    function showPasswordStrength(password) {
        const strengthContainer = document.getElementById('passwordStrength');
        if (!strengthContainer) return;
        
        const strength = calculatePasswordStrength(password);
        const strengthBar = document.createElement('div');
        strengthBar.className = 'password-strength-bar';
        
        strengthContainer.innerHTML = '';
        strengthContainer.appendChild(strengthBar);
        
        if (strength <= 2) {
            strengthBar.classList.add('weak');
        } else if (strength <= 3) {
            strengthBar.classList.add('medium');
        } else {
            strengthBar.classList.add('strong');
        }
    }

    // Mostrar error
    function showError(inputId, message) {
        const input = document.getElementById(inputId);
        const errorElement = document.getElementById(inputId + 'Error');
        
        if (input) input.classList.add('error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }

    // Limpiar error
    function clearError(inputId) {
        const input = document.getElementById(inputId);
        const errorElement = document.getElementById(inputId + 'Error');
        
        if (input) input.classList.remove('error');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
    }

    // Limpiar todos los errores
    function clearAllErrors() {
        const errorElements = document.querySelectorAll('.form-error');
        const inputs = document.querySelectorAll('.form-input');
        
        errorElements.forEach(element => {
            element.textContent = '';
            element.classList.remove('show');
        });
        
        inputs.forEach(input => {
            input.classList.remove('error');
        });
    }

    // Validar formulario de login
    function validateLoginForm() {
        let isValid = true;
        clearAllErrors();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email) {
            showError('email', 'El correo electrónico es obligatorio');
            isValid = false;
        } else if (!validateEmail(email)) {
            showError('email', 'Ingresa un correo electrónico válido');
            isValid = false;
        }

        if (!password) {
            showError('password', 'La contraseña es obligatoria');
            isValid = false;
        }

        return isValid;
    }

    // Validar formulario de registro
    function validateRegisterForm() {
        let isValid = true;
        clearAllErrors();

        const nombre = document.getElementById('nombre').value.trim();
        const apellido = document.getElementById('apellido').value.trim();
        const email = document.getElementById('email').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const terms = document.getElementById('terms').checked;

        if (!nombre) {
            showError('nombre', 'El nombre es obligatorio');
            isValid = false;
        }

        if (!apellido) {
            showError('apellido', 'El apellido es obligatorio');
            isValid = false;
        }

        if (!email) {
            showError('email', 'El correo electrónico es obligatorio');
            isValid = false;
        } else if (!validateEmail(email)) {
            showError('email', 'Ingresa un correo electrónico válido');
            isValid = false;
        }

        if (telefono && !validatePhone(telefono)) {
            showError('telefono', 'Ingresa un número de teléfono válido');
            isValid = false;
        }

        if (!password) {
            showError('password', 'La contraseña es obligatoria');
            isValid = false;
        } else if (!validatePassword(password)) {
            showError('password', 'La contraseña debe tener al menos 8 caracteres');
            isValid = false;
        }

        if (!confirmPassword) {
            showError('confirmPassword', 'Confirma tu contraseña');
            isValid = false;
        } else if (password !== confirmPassword) {
            showError('confirmPassword', 'Las contraseñas no coinciden');
            isValid = false;
        }

        if (!terms) {
            showError('terms', 'Debes aceptar los términos y condiciones');
            isValid = false;
        }

        return isValid;
    }

    // Event listeners para validación en tiempo real
    if (isLoginPage) {
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                if (this.value.trim() && !validateEmail(this.value.trim())) {
                    showError('email', 'Ingresa un correo electrónico válido');
                } else {
                    clearError('email');
                }
            });
        }

        if (passwordInput) {
            passwordInput.addEventListener('blur', function() {
                if (!this.value) {
                    showError('password', 'La contraseña es obligatoria');
                } else {
                    clearError('password');
                }
            });
        }
    }

    if (isRegisterPage) {
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const emailInput = document.getElementById('email');
        const telefonoInput = document.getElementById('telefono');

        // Validación de fuerza de contraseña en tiempo real
        if (passwordInput) {
            passwordInput.addEventListener('input', function() {
                showPasswordStrength(this.value);
                if (this.value && !validatePassword(this.value)) {
                    showError('password', 'La contraseña debe tener al menos 8 caracteres');
                } else {
                    clearError('password');
                }
            });
        }

        // Validación de confirmación de contraseña
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('blur', function() {
                const password = passwordInput.value;
                if (this.value && password !== this.value) {
                    showError('confirmPassword', 'Las contraseñas no coinciden');
                } else {
                    clearError('confirmPassword');
                }
            });
        }

        // Validación de email
        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                if (this.value.trim() && !validateEmail(this.value.trim())) {
                    showError('email', 'Ingresa un correo electrónico válido');
                } else {
                    clearError('email');
                }
            });
        }

        // Validación de teléfono
        if (telefonoInput) {
            telefonoInput.addEventListener('blur', function() {
                if (this.value.trim() && !validatePhone(this.value.trim())) {
                    showError('telefono', 'Ingresa un número de teléfono válido');
                } else {
                    clearError('telefono');
                }
            });
        }
    }

    // Manejo de envío de formulario de login
    if (isLoginPage) {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                if (validateLoginForm()) {
                    const submitBtn = document.getElementById('loginBtn');
                    const email = document.getElementById('email').value.trim();
                    const password = document.getElementById('password').value;
                    const remember = document.getElementById('remember').checked;
                    
                    // Mostrar estado de carga
                    submitBtn.classList.add('loading');
                    submitBtn.disabled = true;
                    
                    // Enviar petición al backend
                    api.post('/auth/login', {
                        email,
                        password,
                        remember
                    })
                    .then(response => {
                        // Guardar token y datos del usuario
                        api.setToken(response.token, remember);
                        api.setUserData(response.user);
                        
                        // Guardar email para recordar
                        if (remember) {
                            localStorage.setItem('userEmail', email);
                        } else {
                            sessionStorage.setItem('userEmail', email);
                        }
                        
                        // Mostrar mensaje de éxito
                        showMessage('¡Inicio de sesión exitoso!', 'success');
                        
                        // Redirigir al dashboard o página principal
                        setTimeout(() => {
                            window.location.href = '../index.html';
                        }, 1500);
                    })
                    .catch(error => {
                        console.error('Error en login:', error);
                        showMessage(error.message || 'Error al iniciar sesión', 'error');
                    })
                    .finally(() => {
                        submitBtn.classList.remove('loading');
                        submitBtn.disabled = false;
                    });
                }
            });
        }
    }

    // Manejo de envío de formulario de registro
    if (isRegisterPage) {
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                if (validateRegisterForm()) {
                    const submitBtn = document.getElementById('registerBtn');
                    const nombre = document.getElementById('nombre').value.trim();
                    const apellido = document.getElementById('apellido').value.trim();
                    const email = document.getElementById('email').value.trim();
                    const telefono = document.getElementById('telefono').value.trim();
                    const password = document.getElementById('password').value;
                    const terms = document.getElementById('terms').checked;
                    
                    // Mostrar estado de carga
                    submitBtn.classList.add('loading');
                    submitBtn.disabled = true;
                    
                    // Enviar petición al backend
                    api.post('/auth/register', {
                        nombre,
                        apellido,
                        email,
                        telefono,
                        password,
                        terms
                    })
                    .then(response => {
                        // Guardar token y datos del usuario
                        api.setToken(response.token, false); // No recordar en registro
                        api.setUserData(response.user);
                        
                        // Mostrar mensaje de éxito
                        showMessage('¡Cuenta creada exitosamente!', 'success');
                        
                        // Redirigir al login o página principal
                        setTimeout(() => {
                            window.location.href = 'login.html';
                        }, 1500);
                    })
                    .catch(error => {
                        console.error('Error en registro:', error);
                        
                        // Mostrar errores específicos del servidor
                        if (error.message && error.message.includes('email')) {
                            showError('email', error.message);
                        } else {
                            showMessage(error.message || 'Error al crear cuenta', 'error');
                        }
                    })
                    .finally(() => {
                        submitBtn.classList.remove('loading');
                        submitBtn.disabled = false;
                    });
                }
            });
        }
    }

    // Login con Google (simulado)
    const googleBtns = document.querySelectorAll('.google-btn');
    googleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            alert('Función de login con Google no implementada aún. Esta función requeriría integración con Google OAuth 2.0.');
        });
    });

    // Función para mostrar mensajes
    function showMessage(message, type = 'info') {
        // Crear elemento de mensaje
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
        
        // Colores según tipo
        if (type === 'success') {
            messageDiv.style.background = '#27ae60';
        } else if (type === 'error') {
            messageDiv.style.background = '#e74c3c';
        } else {
            messageDiv.style.background = '#3498db';
        }
        
        document.body.appendChild(messageDiv);
        
        // Animar entrada
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(0)';
        }, 100);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }

    // Recuperar contraseña
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            const email = prompt('Ingresa tu correo electrónico para recuperar tu contraseña:');
            if (email && validateEmail(email)) {
                // Enviar petición al backend
                api.post('/auth/forgot-password', { email })
                    .then(response => {
                        showMessage(response.message, 'success');
                    })
                    .catch(error => {
                        console.error('Error en recuperación:', error);
                        showMessage(error.message || 'Error al procesar la solicitud', 'error');
                    });
            } else if (email) {
                showMessage('Por favor, ingresa un correo electrónico válido.', 'error');
            }
        });
    }

    // Cargar email guardado si existe
    const savedEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
    const emailInput = document.getElementById('email');
    if (savedEmail && emailInput) {
        emailInput.value = savedEmail;
        if (localStorage.getItem('userEmail')) {
            const rememberCheckbox = document.getElementById('remember');
            if (rememberCheckbox) rememberCheckbox.checked = true;
        }
    }
});
