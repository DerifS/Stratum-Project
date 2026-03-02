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

// 1. Rutas base
router.route('/')
    .get(protect, getProjects)
    .post(protect, createProject);

// 2. Rutas estáticas específicas (DEBEN IR ANTES QUE LAS DINÁMICAS)
// Esto evita que 'all' sea confundido con un ':id'
router.route('/all')
    .get(protect, admin, getAllProjects);

// 3. Rutas dinámicas con parámetros
router.route('/:id')
    .put(protect, updateProject)
    .delete(protect, deleteProject);

module.exports = router;