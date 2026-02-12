import API from "./backendApi";

export const getAllTasks = () =>
  API.get('/tasks/get-tasks')

export const createTask = (data) =>
  API.post('/tasks/create-task', data)

export const updateTask = (id, data) =>
  API.put(`/tasks/update-task/${id}`, data)

export const deleteTask = (id) =>
  API.delete(`/tasks/delete-task/${id}`)

export const toggleTaskCompletion = (id) =>
  API.patch(`/tasks/${id}/toggle`)
