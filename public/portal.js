document.addEventListener('DOMContentLoaded', () => {
    
    // Validar sesión
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // Datos de usuario
    const userRole = localStorage.getItem('authRole');
    const storedUsername = localStorage.getItem('authUsername');

    // Referencias DOM: Navegación
    const navDashboard = document.getElementById('nav-dashboard');
    const navAdmin = document.getElementById('nav-admin');
    const viewDashboard = document.getElementById('view-dashboard');
    const viewAdmin = document.getElementById('view-admin');

    // Referencias DOM: Componentes
    const logoutBtn = document.getElementById('logout-btn');
    const projectForm = document.getElementById('form-cotizacion');
    const projectListDiv = document.getElementById('project-list');
    const adminKanban = document.getElementById('admin-kanban');
    
    // Referencias DOM: KPIs
    const kpiTotal = document.getElementById('kpi-total');
    const kpiActive = document.getElementById('kpi-active');
    const kpiType = document.getElementById('kpi-type');
    const kpiCurrency = document.getElementById('kpi-currency');

    // Configuración inicial de UI
    if (storedUsername) {
        document.getElementById('user-display-name').textContent = storedUsername;
    }
    if (userRole === 'admin') {
        navAdmin.style.display = 'flex'; 
    }

    /** Control de navegación entre vistas. */
    const showView = (viewName) => {
        if (viewName === 'admin') {
            viewDashboard.style.display = 'none';
            viewAdmin.style.display = 'block';
            navDashboard.classList.remove('active');
            navAdmin.classList.add('active');
            fetchAllProjects(); 
        } else {
            viewDashboard.style.display = 'block';
            viewAdmin.style.display = 'none';
            navAdmin.classList.remove('active');
            navDashboard.classList.add('active');
            fetchProjects(); 
        }
    };

    navDashboard.addEventListener('click', () => showView('dashboard'));
    navAdmin.addEventListener('click', () => showView('admin'));

    /** Calcular y renderizar KPIs. */
    const updateKPIs = (projects) => {
        if(!Array.isArray(projects)) return;

        kpiTotal.textContent = projects.length;
        
        const activos = projects.filter(p => p.status !== 'Completado').length;
        kpiActive.textContent = activos;

        // Calcular moda estadística (Servicio más solicitado)
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

    /** Consultar API de divisas. */
    const fetchCurrency = async () => {
        try {
            const res = await fetch('/api/currency');
            const data = await res.json();
            kpiCurrency.textContent = `$${data.mxn.toFixed(2)} MXN`;
        } catch (error) {
            kpiCurrency.textContent = "No disp.";
        }
    };

    /** Obtener proyectos (Cliente). */
    const fetchProjects = async () => {
        try {
            const response = await fetch('/api/projects', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401) {
                logout();
                return;
            }
            const data = await response.json();
            const projectsArray = Array.isArray(data) ? data : (data.projects || []);
            
            renderProjects(projectsArray);
            updateKPIs(projectsArray);
        } catch (error) {
            projectListDiv.innerHTML = `<p style="color: #ef4444;">${error.message}</p>`;
        }
    };

    const renderProjects = (projects) => {
        projectListDiv.innerHTML = '';
        if (projects.length === 0) {
            projectListDiv.innerHTML = `<div class="empty-state"><p>No tienes proyectos activos.</p></div>`;
            return;
        }

        projects.forEach(project => {
            const item = document.createElement('div');
            item.className = 'project-row';
            const tipoLimpio = project.serviceType.replace('-', ' ');
            const fecha = new Date(project.createdAt).toLocaleDateString();

            // Renderizado condicional: Controles Admin
            let statusDisplay;
            if (userRole === 'admin') {
                statusDisplay = `<select class="status-select" onchange="actualizarEstado('${project._id}', this.value)">
                    <option value="Recibido" ${project.status === 'Recibido' ? 'selected' : ''}>Recibido</option>
                    <option value="En Progreso" ${project.status === 'En Progreso' ? 'selected' : ''}>En Progreso</option>
                    <option value="En Revisión" ${project.status === 'En Revisión' ? 'selected' : ''}>En Revisión</option>
                    <option value="Completado" ${project.status === 'Completado' ? 'selected' : ''}>Completado</option>
                </select>`;
            } else {
                statusDisplay = `<span class="status-badge badge-primary">${project.status}</span>`;
            }

            item.innerHTML = `
                <div class="p-main">
                    <h4 class="p-title">${tipoLimpio}</h4>
                    <p class="p-desc">${project.description}</p>
                </div>
                <div class="p-meta">
                    <span class="p-date"><i class='bx bx-calendar'></i> ${fecha}</span>
                    ${statusDisplay}
                    <button class="btn-delete" onclick="borrarProyecto('${project._id}')"><i class='bx bx-trash'></i></button>
                </div>`;
            projectListDiv.appendChild(item);
        });
    };

    /** Obtener todos los proyectos (Admin). */
    const fetchAllProjects = async () => {
        try {
            const response = await fetch('/api/projects/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Acceso denegado: Revisa que seas admin");
            const projects = await response.json();
            renderAdminBoard(projects);
        } catch (error) {
            adminKanban.innerHTML = `<p style="color: #ef4444;">${error.message}</p>`;
        }
    };

    const renderAdminBoard = (projects) => {
        adminKanban.innerHTML = '';
        const estados = ['Recibido', 'En Progreso', 'En Revisión', 'Completado'];

        estados.forEach(status => {
            const col = document.createElement('div');
            col.className = 'admin-column';
            const filtrados = projects.filter(p => p.status === status);

            col.innerHTML = `
                <div class="column-title">${status} <span class="project-count">${filtrados.length}</span></div>
                <div class="admin-card-list">
                    ${filtrados.map(p => `
                        <div class="admin-project-card">
                            <h4 class="admin-card-title">${p.serviceType.replace('-', ' ')}</h4>
                            <p class="admin-card-user">Cliente: <span>${p.user ? p.user.username : 'desconocido'}</span></p>
                            <p class="admin-card-desc">${p.description}</p>
                            <select class="status-select" style="width: 100%; margin-top: 10px;" onchange="actualizarEstado('${p._id}', this.value)">
                                ${estados.map(e => `<option value="${e}" ${p.status === e ? 'selected' : ''}>${e}</option>`).join('')}
                            </select>
                        </div>
                    `).join('')}
                </div>`;
            adminKanban.appendChild(col);
        });
    };

    /** Exponer métodos globales. */
    window.actualizarEstado = async (id, nuevoStatus) => {
        try {
            const response = await fetch(`/api/projects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: nuevoStatus })
            });
            if (!response.ok) throw new Error();
            
            // Refrescar vista activa
            if (viewAdmin.style.display === 'block') {
                fetchAllProjects();
            } else {
                fetchProjects();
            }
        } catch (error) {
            alert('No se pudo actualizar el estado.');
        }
    };

    window.borrarProyecto = async (id) => {
        if(confirm('¿Seguro que quieres borrar este pedido?')) {
            try {
                await fetch(`/api/projects/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                fetchProjects();
                if(viewAdmin.style.display === 'block') fetchAllProjects();
            } catch (error) {
                console.error(error);
            }
        }
    };

    /** Event Listeners */
    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const serviceType = projectForm.servicio.value;
        const description = projectForm.mensaje.value;
        try {
            await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ serviceType, description })
            });
            projectForm.reset();
            fetchProjects();
        } catch (error) {
            alert('Error al registrar el proyecto.');
        }
    });

    const logout = () => {
        localStorage.clear();
        window.location.href = '/login.html';
    };

    logoutBtn.addEventListener('click', logout);

    // Inicialización
    fetchCurrency();
    fetchProjects();
});