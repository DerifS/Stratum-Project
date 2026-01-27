// Espero a que todo el HTML se cargue antes de ejecutar mi código.
document.addEventListener('DOMContentLoaded', () => {

    // Primero, identifico los elementos del HTML con los que voy a trabajar.
    const registerForm = document.getElementById('register-form');
    const errorMessage = document.getElementById('error-message');

    // Ahora, le digo al formulario qué hacer cuando el usuario le dé a "submit".
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Esto evita que la página se recargue, que es el comportamiento por defecto.

        // Limpio cualquier mensaje de error anterior.
        errorMessage.textContent = '';

        // Obtengo los valores que el usuario escribió en los campos.
        const username = registerForm.username.value;
        const password = registerForm.password.value;
        const password2 = registerForm.password2.value;

        // Mi primera validación: las contraseñas deben coincidir.
        if (password !== password2) {
            errorMessage.textContent = 'Las contraseñas no coinciden.';
            return; // Detengo la ejecución si no coinciden.
        }

        // Si todo va bien, intento registrar al usuario en el backend.
        try {
            // Hago la petición a mi endpoint de registro.
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            // Si el backend me devuelve un error (ej. el usuario ya existe), lo muestro.
            if (!response.ok) {
                throw new Error(data.message || 'No se pudo completar el registro.');
            }

            // Si el registro es exitoso, guardo el token que me dio el backend.
            localStorage.setItem('authToken', data.token);
            
            // Y redirijo al usuario directamente a su portal privado. ¡Una mejor experiencia!
            window.location.href = '/portal.html';

        } catch (error) {
            // Si algo falla durante la petición, muestro el error en la página.
            errorMessage.textContent = error.message;
        }
    });
});