// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBY9C0YPQoCa1vrjWH9yqZ-frtz3V_buMw",
    authDomain: "ecoeduca-ed64b.firebaseapp.com",
    projectId: "ecoeduca-ed64b",
    storageBucket: "ecoeduca-ed64b.firebasestorage.app",
    messagingSenderId: "580315594884",
    appId: "1:580315594884:web:886be06849f63c324b42d1",
    measurementId: "G-1NSSST2RGX"
};

// Inicializar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, updateProfile, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Exportar funciones para uso global
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDb = db;
window.firebaseAnalytics = analytics;

// Funciones de autenticación
window.firebaseFunctions = {
    // Login con email y contraseña
    async signIn(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Obtener datos adicionales del usuario desde Firestore
            const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
            const userData = userDoc.data();
            
            return {
                success: true,
                user: {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    ...userData
                }
            };
        } catch (error) {
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    },

    // Registro de nuevo usuario
    async signUp(email, password, userData) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Actualizar perfil
            await updateProfile(user, {
                displayName: `${userData.nombre} ${userData.apellido}`
            });
            
            // Guardar datos adicionales en Firestore
            await setDoc(doc(db, 'usuarios', user.uid), {
                nombre: userData.nombre,
                apellido: userData.apellido,
                email: email,
                telefono: userData.telefono || '',
                rol: 'usuario',
                emailVerificado: false,
                fechaRegistro: serverTimestamp(),
                activo: true
            });
            
            return {
                success: true,
                user: {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    ...userData
                }
            };
        } catch (error) {
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    },

    // Login con Google
    async signInWithGoogle() {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            // Verificar si el usuario ya existe en Firestore
            const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
            
            if (!userDoc.exists()) {
                // Crear documento de usuario si no existe
                await setDoc(doc(db, 'usuarios', user.uid), {
                    nombre: user.displayName.split(' ')[0] || '',
                    apellido: user.displayName.split(' ')[1] || '',
                    email: user.email,
                    telefono: user.phoneNumber || '',
                    rol: 'usuario',
                    emailVerificado: true,
                    fechaRegistro: serverTimestamp(),
                    activo: true,
                    fotoPerfil: user.photoURL || ''
                });
            }
            
            const userData = userDoc.exists() ? userDoc.data() : {};
            
            return {
                success: true,
                user: {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    ...userData
                }
            };
        } catch (error) {
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    },

    // Cerrar sesión
    async signOut() {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    },

    // Recuperar contraseña
    async resetPassword(email) {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    },

    // Obtener usuario actual
    getCurrentUser() {
        return auth.currentUser;
    },

    // Escuchar cambios de autenticación
    onAuthStateChanged(callback) {
        return onAuthStateChanged(auth, callback);
    },

    // Actualizar perfil de usuario
    async updateProfile(userData) {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('No hay usuario autenticado');
            
            // Actualizar en Auth
            if (userData.nombre || userData.apellido) {
                const displayName = `${userData.nombre || ''} ${userData.apellido || ''}`.trim();
                await updateProfile(user, { displayName });
            }
            
            // Actualizar en Firestore
            const userRef = doc(db, 'usuarios', user.uid);
            await updateDoc(userRef, {
                ...userData,
                updatedAt: serverTimestamp()
            });
            
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    },

    // Obtener mensaje de error en español
    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/email-already-in-use': 'Este correo electrónico ya está registrado',
            'auth/invalid-email': 'El correo electrónico no es válido',
            'auth/user-disabled': 'La cuenta ha sido deshabilitada',
            'auth/user-not-found': 'No existe una cuenta con este correo electrónico',
            'auth/wrong-password': 'La contraseña es incorrecta',
            'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde',
            'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
            'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
            'auth/operation-not-allowed': 'Operación no permitida',
            'auth/expired-action-code': 'El código de verificación ha expirado',
            'auth/invalid-action-code': 'El código de verificación no es válido',
            'auth/popup-closed-by-user': 'La ventana emergente fue cerrada antes de completar el login'
        };
        
        return errorMessages[errorCode] || 'Ha ocurrido un error. Intenta nuevamente';
    }
};

console.log('🔥 Firebase configurado exitosamente');
