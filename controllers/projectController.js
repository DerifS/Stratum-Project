const Project = require('../models/Project');
const mongoose = require('mongoose'); // <-- Importante para validar el ID

// Obtener proyectos con PAGINACIÓN
const getProjects = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { user: req.user.id };

    const projects = await Project.find(query)
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const count = await Project.countDocuments(query);

    res.json({
      projects,
      page,
      pages: Math.ceil(count / limit),
      totalProjects: count
    });
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo proyecto
const createProject = async (req, res, next) => {
  const { serviceType, description } = req.body;
  try {
    const project = new Project({
      serviceType,
      description,
      user: req.user.id
    });
    const createdProject = await project.save();
    res.status(201).json(createdProject);
  } catch (error) {
    next(error);
  }
};

// Eliminar un proyecto (VERSIÓN FINAL Y ROBUSTA)
const deleteProject = async (req, res, next) => {
    try {
        const projectId = req.params.id;

        // 1. BLINDAJE DE SEGURIDAD: Validar que el ID es un ID de Mongo válido.
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            res.status(400); // Bad Request
            throw new Error('ID de proyecto no válido');
        }
        
        // 2. Buscamos el proyecto
        const project = await Project.findById(projectId);

        // 3. Si no existe, error 404
        if (!project) {
            res.status(404);
            throw new Error('Proyecto no encontrado');
        }

        // 4. Verificamos permisos (Solo el dueño o un admin pueden borrar)
        if (project.user.toString() !== req.user.id && req.user.role !== 'admin') {
            res.status(401);
            throw new Error('No tienes permiso para eliminar este proyecto');
        }

        // 5. Lo eliminamos usando el ID
        await Project.findByIdAndDelete(projectId);
        
        // 6. Enviamos una respuesta de éxito
        res.status(200).json({ message: 'Eliminado correctamente', id: projectId });
    } catch (error) {
        // Cualquier error es atrapado aquí y enviado al middleware de errores
        next(error);
    }
};

// Actualizar
const updateProject = async (req, res, next) => {
    try {
        const { status } = req.body;
        const project = await Project.findById(req.params.id);

        if (!project) {
            res.status(404);
            throw new Error('Proyecto no encontrado');
        }

        // Seguridad: Solo un admin puede cambiar el estado
        if (req.user.role !== 'admin') {
            res.status(403); // Forbidden
            throw new Error('No tienes permiso para actualizar proyectos');
        }

        project.status = status || project.status; // Actualiza el estado
        const updatedProject = await project.save();
        
        res.json(updatedProject);
    } catch (error) {
        next(error);
    }
};

module.exports = { getProjects, createProject, updateProject, deleteProject };