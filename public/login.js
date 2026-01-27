// Espero a que el DOM esté listo.
document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.textContent = '';

        const username = loginForm.username.value;
        const password = loginForm.password.value;

        try {
            // Hago la petición a mi endpoint de login.
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Si las credenciales son incorrectas, el backend me lo dirá.
                throw new Error(data.message || 'Error al iniciar sesión.');
            }

            // Si todo está bien, guardo el token.
            localStorage.setItem('authToken', data.token);

            // Redirijo al portal del cliente.
            window.location.href = '/portal.html';

        } catch (error) {
            errorMessage.textContent = error.message;
        }
    });
});