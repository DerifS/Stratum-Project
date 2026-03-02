const Project = require('../models/Project');

// Obtener proyectos con PAGINACIÓN
const getProjects = async (req, res, next) => {
  try {
    // 1. Obtener parámetros de paginación de la URL (ej: ?page=2&limit=5)
    // Si no vienen, usamos valores por defecto: página 1, 10 proyectos por página.
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 2. Definir la consulta (solo proyectos del usuario logueado)
    const query = { user: req.user.id };

    // 3. Buscar en BD aplicando límites
    const projects = await Project.find(query)
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 }); // Los más nuevos primero

    // 4. Contar total de documentos para saber cuántas páginas hay
    const count = await Project.countDocuments(query);

    // 5. Responder con estructura paginada
    res.json({
      projects,        // Los datos
      page,            // Página actual
      pages: Math.ceil(count / limit), // Total de páginas
      totalProjects: count // Total de registros
    });
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo proyecto (Se mantiene igual, pero lo incluyo para que tengas el archivo completo)
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

const updateProject = async (req, res, next) => { /* Pendiente */ };
const deleteProject = async (req, res, next) => { /* Pendiente */ };

module.exports = { getProjects, createProject, updateProject, deleteProject };