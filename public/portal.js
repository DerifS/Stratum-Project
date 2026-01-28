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
        projectListDiv.innerHTML = '';

        if (projects.length === 0) {
            projectListDiv.innerHTML = `
                <div style="text-align: center; padding: 40px; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.1);">
                    <p style="color: var(--text-muted); margin-bottom: 5px;">No hay proyectos activos.</p>
                    <p style="font-size: 0.9rem; color: #555;">Usa el formulario de la izquierda para crear el primero.</p>
                </div>`;
            return;
        }

        // Renderizado mejorado con las nuevas clases CSS del diseño de 2 columnas
        projects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card-item'; // Clase nueva del CSS
            
            // Formateo la fecha para que se vea bonita (Ej: 28 de enero de 2026)
            const fecha = new Date(project.createdAt).toLocaleDateString('es-ES', { 
                day: 'numeric', month: 'long', year: 'numeric' 
            });

            // Convierto el tipo de servicio a un formato legible (Ej: "diseno-cad" -> "Diseno cad")
            const tipoServicio = project.serviceType.replace('-', ' ');

            projectCard.innerHTML = `
                <div>
                    <h3 style="margin-bottom: 8px; font-size: 1.1rem; text-transform: capitalize;">${tipoServicio}</h3>
                    <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 10px;">${project.description}</p>
                    <small style="color: #64748b; font-size: 0.8rem;">📅 Solicitado el: ${fecha}</small>
                </div>
                <div>
                    <span class="status-badge">${project.status}</span>
                </div>
            `;
            projectListDiv.appendChild(projectCard);
        });
    };

    // --- LÓGICA PARA ENVIAR UN NUEVO PROYECTO ---
    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const serviceType = projectForm.servicio.value;
        const description = projectForm.mensaje.value;

        // Validación básica
        if (!description.trim()) return;

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