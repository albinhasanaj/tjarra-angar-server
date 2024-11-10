// routes/taskRoutes.js
const express = require('express');
const taskController = require('../controllers/taskController');

module.exports = (upload) => {
    const router = express.Router();

    router.post('/create-task', upload.any(), taskController.createTask);
    router.get('/get-all-tasks', taskController.getAllTasks);
    router.get('/get-task/:id', taskController.getTaskById);
    router.get('/user-tasks/:name', taskController.getUserTasksByName);
    router.post('/update-task/:id', upload.any(), taskController.updateTask);
    router.delete('/delete-task/:id', taskController.deleteTask);

    return router;
};
