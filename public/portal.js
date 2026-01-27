// Espero a que se cargue todo el HTML.
document.addEventListener('DOMContentLoaded', () => {
    
    // Lo primero y más importante: verifico si el usuario tiene un token de sesión.
    const token = localStorage.getItem('authToken');
    if (!token) {
        // Si no hay token, no tiene nada que hacer aquí. Lo mando a la página de login.
        window.location.href = '/login.html';
        return; // Detengo la ejecución del script.
    }

    // Identifico todos los elementos con los que voy a interactuar.
    const logoutBtn = document.getElementById('logout-btn');
    const projectForm = document.getElementById('form-cotizacion');
    const projectListDiv = document.getElementById('project-list');
    const loadingMessage = document.getElementById('loading-message');

    // --- FUNCIÓN PARA OBTENER LOS PROYECTOS DEL USUARIO ---
    const fetchProjects = async () => {
        try {
            const response = await fetch('/api/projects', {
                method: 'GET',
                headers: {
                    // Envío el token para que el backend sepa quién soy y me dé mis proyectos.
                    'Authorization': `Bearer ${token}`
                }
            });

            // Si el token es inválido o expiró, el backend me dará un error 401.
            if (response.status === 401) {
                localStorage.removeItem('authToken'); // Limpio el token viejo.
                window.location.href = '/login.html'; // Lo mando a iniciar sesión de nuevo.
                return;
            }
            if (!response.ok) {
                throw new Error('No se pudieron cargar los proyectos.');
            }

            const projects = await response.json();
            renderProjects(projects);

        } catch (error) {
            projectListDiv.innerHTML = `<p style="color: #d93025; text-align: center;">${error.message}</p>`;
        }
    };

    // --- FUNCIÓN PARA MOSTRAR LOS PROYECTOS EN EL HTML ---
    const renderProjects = (projects) => {
        // Primero, limpio la lista (y el mensaje de "cargando").
        projectListDiv.innerHTML = '';

        if (projects.length === 0) {
            projectListDiv.innerHTML = `<p style="color: var(--text-muted); text-align: center;">Aún no has enviado ninguna solicitud de proyecto.</p>`;
            return;
        }

        // Por cada proyecto en la lista, creo una tarjeta HTML.
        projects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'card'; // Reutilizo la clase de estilo que ya tienes.
            projectCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin-bottom: 5px;">${project.serviceType.replace('-', ' ')}</h3>
                    <strong style="color: #06b6d4;">${project.status}</strong>
                </div>
                <p style="color: var(--text-muted); font-size: 0.9rem;">${project.description}</p>
                <small style="color: var(--text-muted); opacity: 0.6;">Solicitado: ${new Date(project.createdAt).toLocaleDateString()}</small>
            `;
            projectListDiv.appendChild(projectCard);
        });
    };

    // --- LÓGICA PARA ENVIAR UN NUEVO PROYECTO ---
    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const serviceType = projectForm.servicio.value;
        const description = projectForm.mensaje.value;

        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // También necesito el token para crear.
                },
                body: JSON.stringify({ serviceType, description })
            });

            if (!response.ok) {
                throw new Error('No se pudo enviar la solicitud.');
            }

            projectForm.reset(); // Limpio el formulario.
            fetchProjects(); // Vuelvo a cargar la lista para que aparezca el nuevo proyecto.

        } catch (error) {
            alert(error.message); // Muestro una alerta simple si falla.
        }
    });

    // --- LÓGICA PARA CERRAR SESIÓN ---
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        window.location.href = '/login.html';
    });


    // --- LLAMADA INICIAL ---
    // Al cargar la página, lo primero que hago es ir a buscar los proyectos del cliente.
    fetchProjects();
});