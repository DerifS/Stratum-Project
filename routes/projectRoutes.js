const express = require('express');
const router = express.Router();
const { 
    getProjects, 
    createProject, 
    updateProject, 
    deleteProject, 
    getAllProjects 
} = require('../controllers/projectController');
const { protect, admin } = require('../middleware/authMiddleware');

// Endpoints base
router.route('/')
    .get(protect, getProjects)
    .post(protect, createProject);

// Endpoints estáticos (Precedencia sobre dinámicos)
router.route('/all')
    .get(protect, admin, getAllProjects);

// Endpoints dinámicos
router.route('/:id')
    .put(protect, updateProject)
    .delete(protect, deleteProject);

module.exports = router;