document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const errorMessage = document.getElementById('error-message');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.textContent = '';

        const username = registerForm.username.value;
        const password = registerForm.password.value;
        const password2 = registerForm.password2.value;

        if (password !== password2) {
            errorMessage.textContent = 'Las contraseñas no coinciden.';
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'No se pudo completar el registro.');

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