const Project = require('../models/Project');
const mongoose = require('mongoose');

/** Obtiene una lista paginada de proyectos asociados al usuario autenticado. */
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

/** Crea un nuevo registro de proyecto vinculado al usuario en sesión. */
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

/** Elimina un proyecto específico por ID, previa validación de existencia y permisos. */
const deleteProject = async (req, res, next) => {
    try {
        const projectId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            res.status(400);
            throw new Error('ID de proyecto no válido');
        }
        
        const project = await Project.findById(projectId);

        if (!project) {
            res.status(404);
            throw new Error('Proyecto no encontrado');
        }

        // Validación de permisos: Propietario del recurso o Administrador
        if (project.user.toString() !== req.user.id && req.user.role !== 'admin') {
            res.status(401);
            throw new Error('No tienes permiso para eliminar este proyecto');
        }

        await Project.findByIdAndDelete(projectId);
        
        res.status(200).json({ message: 'Eliminado correctamente', id: projectId });
    } catch (error) {
        next(error);
    }
};

/** Actualiza el estado de un proyecto existente (Requiere privilegios de administrador). */
const updateProject = async (req, res, next) => {
    try {
        const { status } = req.body;
        const project = await Project.findById(req.params.id);

        if (!project) {
            res.status(404);
            throw new Error('Proyecto no encontrado');
        }

        // Control de acceso: Solo administradores pueden modificar el estado
        if (req.user.role !== 'admin') {
            res.status(403); // Forbidden
            throw new Error('No tienes permiso para actualizar proyectos');
        }

        project.status = status || project.status;
        const updatedProject = await project.save();
        
        res.json(updatedProject);
    } catch (error) {
        next(error);
    }
};

/** Recupera la totalidad de proyectos registrados en el sistema (Ruta administrativa). */
const getAllProjects = async (req, res, next) => {
    try {
        const projects = await Project.find({})
            .populate('user', 'username')
            .sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        next(error);
    }
};

module.exports = { getProjects, createProject, updateProject, deleteProject, getAllProjects };