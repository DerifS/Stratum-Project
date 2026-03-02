document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Verificación de Seguridad
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // 2. Mostrar nombre de usuario real
    const storedUsername = localStorage.getItem('authUsername');
    if (storedUsername) {
        document.getElementById('user-display-name').textContent = storedUsername;
    }

    // Elementos del DOM
    const logoutBtn = document.getElementById('logout-btn');
    const projectForm = document.getElementById('form-cotizacion');
    const projectListDiv = document.getElementById('project-list');
    
    // Elementos KPI
    const kpiTotal = document.getElementById('kpi-total');
    const kpiActive = document.getElementById('kpi-active');
    const kpiType = document.getElementById('kpi-type');
    const kpiCurrency = document.getElementById('kpi-currency');

    // --- CARGAR DATOS DE API EXTERNA (Dólar) ---
    const fetchCurrency = async () => {
        try {
            const res = await fetch('/api/currency');
            const data = await res.json();
            kpiCurrency.textContent = `$${data.mxn.toFixed(2)} MXN`;
        } catch (error) {
            kpiCurrency.textContent = "No disp.";
        }
    };

    // --- CARGAR PROYECTOS DEL BACKEND ---
    const fetchProjects = async () => {
        try {
            const response = await fetch('/api/projects', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401) {
                localStorage.clear(); // Limpia toda la sesión
                window.location.href = '/login.html';
                return;
            }
            if (!response.ok) throw new Error('Error de conexión');

            const data = await response.json();
            
            const projectsArray = Array.isArray(data) ? data : (data.projects || []);
            
            renderProjects(projectsArray);
            updateKPIs(projectsArray);

        } catch (error) {
            projectListDiv.innerHTML = `<div class="empty-state"><p style="color: #ef4444;">${error.message}</p></div>`;
        }
    };

    // --- ACTUALIZAR TARJETAS SUPERIORES (KPIs) ---
    const updateKPIs = (projects) => {
        if(!projects) return;
        kpiTotal.textContent = projects.length;
        const activos = projects.filter(p => p.status !== 'Completado').length;
        kpiActive.textContent = activos;

        if(projects.length > 0) {
            const counts = {};
            let maxServ = projects[0].serviceType;
            let maxCount = 0;
            projects.forEach(p => {
                counts[p.serviceType] = (counts[p.serviceType] || 0) + 1;
                if(counts[p.serviceType] > maxCount) {
                    maxCount = counts[p.serviceType];
                    maxServ = p.serviceType;
                }
            });
            kpiType.textContent = maxServ.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        } else {
            kpiType.textContent = "-";
        }
    };

    // --- RENDERIZAR LISTA DE PROYECTOS (CON UPDATE PARA ADMINS) ---
    const renderProjects = (projects) => {
        projectListDiv.innerHTML = '';
        const userRole = localStorage.getItem('authRole'); // Leo el rol del usuario

        if (projects.length === 0) {
            projectListDiv.innerHTML = `<div class="empty-state"><i class='bx bx-folder-open' style="font-size: 3rem; color: #334155;"></i><p>No tienes proyectos activos.</p></div>`;
            return;
        }

        projects.forEach(project => {
            const item = document.createElement('div');
            item.className = 'project-row';
            
            const tipoLimpio = project.serviceType.replace('-', ' ');
            const dateObj = new Date(project.createdAt);
            const fecha = `${dateObj.getDate()}/${dateObj.getMonth()+1}/${dateObj.getFullYear()}`;

            let badgeStyle = 'badge-default';
            if(project.status === 'Recibido') badgeStyle = 'badge-primary';
            if(project.status === 'En Progreso') badgeStyle = 'badge-warning';
            if(project.status === 'Completado') badgeStyle = 'badge-success';

            // AQUÍ ESTÁ LA LÓGICA DE ROLES
            let statusDisplay;
            if (userRole === 'admin') {
                // Si es admin, creo un menú desplegable
                statusDisplay = `
                    <select class="status-select" onchange="actualizarEstado('${project._id}', this.value)">
                        <option value="Recibido" ${project.status === 'Recibido' ? 'selected' : ''}>Recibido</option>
                        <option value="En Progreso" ${project.status === 'En Progreso' ? 'selected' : ''}>En Progreso</option>
                        <option value="En Revisión" ${project.status === 'En Revisión' ? 'selected' : ''}>En Revisión</option>
                        <option value="Completado" ${project.status === 'Completado' ? 'selected' : ''}>Completado</option>
                    </select>
                `;
            } else {
                // Si es cliente, solo muestro el texto
                statusDisplay = `<span class="status-badge ${badgeStyle}">${project.status}</span>`;
            }

            item.innerHTML = `
                <div class="p-main">
                    <h4 class="p-title">${tipoLimpio}</h4>
                    <p class="p-desc">${project.description}</p>
                </div>
                <div class="p-meta">
                    <span class="p-date"><i class='bx bx-calendar'></i> ${fecha}</span>
                    ${statusDisplay}
                    <button class="btn-delete" onclick="borrarProyecto('${project._id}')" title="Eliminar proyecto">
                        <i class='bx bx-trash'></i>
                    </button>
                </div>
            `;
            projectListDiv.appendChild(item);
        });
    };

    // --- FUNCIÓN GLOBAL PARA ACTUALIZAR ESTADO (PARA ADMIN) ---
    window.actualizarEstado = async (id, nuevoStatus) => {
        try {
            const response = await fetch(`/api/projects/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: nuevoStatus })
            });
            if (!response.ok) throw new Error('Fallo al actualizar');
            fetchProjects(); // Recargamos para ver el cambio
        } catch (error) {
            alert('Error al actualizar el estado.');
        }
    };

    // --- FUNCIÓN GLOBAL PARA BORRAR ---
    window.borrarProyecto = async (id) => {
        if(confirm('¿Estás seguro de eliminar esta solicitud permanentemente?')) {
            try {
                const response = await fetch(`/api/projects/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if(!response.ok) throw new Error("No se pudo eliminar");
                fetchProjects(); 
            } catch (error) {
                alert(error.message);
            }
        }
    };

    // --- ENVIAR NUEVA SOLICITUD ---
    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const serviceType = projectForm.servicio.value;
        const description = projectForm.mensaje.value;
        const btn = projectForm.querySelector('button');
        const originalText = btn.innerHTML;
        
        try {
            btn.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i> Procesando...`;
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ serviceType, description })
            });
            if (!response.ok) throw new Error('Fallo al crear proyecto');
            projectForm.reset();
            await fetchProjects();
        } catch (error) {
            alert(error.message);
        } finally {
            btn.innerHTML = originalText;
        }
    });

    // --- LOGOUT ---
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUsername');
        localStorage.removeItem('authRole'); // Asegurarse de borrar el rol también
        window.location.href = '/login.html';
    });

    // Init
    fetchCurrency();
    fetchProjects();
});