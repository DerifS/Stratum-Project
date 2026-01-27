const Project = require('../models/Project');

// Obtener todos los proyectos del usuario logueado
const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ user: req.user.id });
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo proyecto
const createProject = async (req, res, next) => {
  // AQUI ESTABA EL ERROR: Cambie 'title' por 'serviceType'
  const { serviceType, description } = req.body;
  
  try {
    const project = new Project({
      serviceType, // Ahora guardamos el tipo de servicio correctamente
      description,
      user: req.user.id 
    });
    
    const createdProject = await project.save();
    res.status(201).json(createdProject);
  } catch (error) {
    next(error);
  }
};

// Actualizar un proyecto
const updateProject = async (req, res, next) => {
    // Pendiente de implementar
};

// Eliminar un proyecto
const deleteProject = async (req, res, next) => {
    // Pendiente de implementar
};

module.exports = { getProjects, createProject, updateProject, deleteProject };