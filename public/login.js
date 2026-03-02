document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.textContent = '';

        const username = loginForm.username.value;
        const password = loginForm.password.value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Error al iniciar sesión.');

            // GUARDAMOS EL TOKEN Y EL NOMBRE DE USUARIO REAL
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('authUsername', data.username);
            localStorage.setItem('authRole', data.role);

            window.location.href = '/portal.html';

        } catch (error) {
            errorMessage.textContent = error.message;
        }
    });
});