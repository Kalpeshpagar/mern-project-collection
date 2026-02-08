import express from "express"
import protect from "../middlewares/auth.middleware.js";
import { createTask, deleteAllTasks, deleteTask, getAllTasks, toggleTaskCompletion, updateTask } from "../controllers/task.controller.js";

const taskRouter = express.Router();

taskRouter.post('/create-task', protect, createTask)
taskRouter.get('/get-tasks', protect, getAllTasks)
taskRouter.put('/update-task/:id', protect, updateTask)
taskRouter.delete('/delete-task/:id', protect, deleteTask)
taskRouter.delete('/delete-all-tasks', protect, deleteAllTasks)
taskRouter.patch('/:id/toggle', protect, toggleTaskCompletion)



export default taskRouter