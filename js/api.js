// Configuración de la API
const API_BASE_URL = window.location.hostname === 'localhost' ? 
    'http://localhost:3000/api' : '/api';

// Clase para manejar las peticiones a la API
class ApiClient {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    }

    // Obtener headers para las peticiones
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Manejar errores de respuesta
    async handleResponse(response) {
        const data = await response.json();

        if (!response.ok) {
            // Si el token es inválido, cerrar sesión
            if (response.status === 401) {
                this.logout();
                throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
            }

            throw new Error(data.error || data.message || 'Error en la petición');
        }

        return data;
    }

    // Petición GET
    async get(endpoint) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error en GET:', error);
            throw error;
        }
    }

    // Petición POST
    async post(endpoint, data) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error en POST:', error);
            throw error;
        }
    }

    // Petición PUT
    async put(endpoint, data) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error en PUT:', error);
            throw error;
        }
    }

    // Petición DELETE
    async delete(endpoint) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error en DELETE:', error);
            throw error;
        }
    }

    // Guardar token
    setToken(token, remember = false) {
        this.token = token;
        
        if (remember) {
            localStorage.setItem('authToken', token);
            localStorage.removeItem('sessionToken');
        } else {
            sessionStorage.setItem('authToken', token);
            localStorage.removeItem('authToken');
        }
    }

    // Obtener token
    getToken() {
        return this.token;
    }

    // Cerrar sesión
    logout() {
        this.token = null;
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        
        // Redirigir al login si no estamos ya en login
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'html/login.html';
        }
    }

    // Verificar si está autenticado
    isAuthenticated() {
        return !!this.token;
    }

    // Guardar datos del usuario
    setUserData(userData) {
        localStorage.setItem('userData', JSON.stringify(userData));
    }

    // Obtener datos del usuario
    getUserData() {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    }
}

// Crear instancia global de la API
const api = new ApiClient();

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ApiClient, api };
} else {
    window.ApiClient = ApiClient;
    window.api = api;
}
