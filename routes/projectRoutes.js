const express = require('express');
const router = express.Router();
const { getProjects, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

// Aplico el middleware 'protect' a todas las rutas de proyectos.
// Esto me asegura que solo los usuarios autenticados puedan acceder.
router.route('/').get(protect, getProjects).post(protect, createProject);
router.route('/:id').put(protect, updateProject).delete(protect, deleteProject);

module.exports = router;