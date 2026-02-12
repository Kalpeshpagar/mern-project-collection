import { useEffect, useState } from "react"
import {
  getAllTasks,
  deleteTask,
  toggleTaskCompletion,
  updateTask
} from "../api/task.api"

import TaskForm from "../components/TaskForm"
import TaskItem from "../components/TaskItem"
import "../styles/dashboard.css"

const Dashboard = () => {
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState("all")

  // Fetch tasks on mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await getAllTasks()
        setTasks(res.data.tasks || [])
      } catch (error) {
        console.log(error)
      }
    }

    fetchTasks()
  }, [])

  // Handle new task (from TaskForm)
  const handleTaskCreated = (newTask) => {
  if (!newTask || !newTask._id) return
  setTasks(prev => [newTask, ...prev])
}


  // Handle delete
  const handleDelete = async (id) => {
    try {
      await deleteTask(id)
      setTasks(prev =>
        prev.filter(task => task._id !== id)
      )
    } catch (error) {
      console.log(error)
    }
  }

  // Handle toggle
  const handleToggle = async (id) => {
    try {
      await toggleTaskCompletion(id)

      setTasks(prev =>
        prev.map(task =>
          task._id === id
            ? { ...task, completed: !task.completed }
            : task
        )
      )
    } catch (error) {
      console.log(error)
    }
  }

  // Handle update
  const handleUpdate = async (id, updatedData) => {
    try {
      await updateTask(id, updatedData)

      setTasks(prev =>
        prev.map(task =>
          task._id === id
            ? { ...task, ...updatedData }
            : task
        )
      )
    } catch (error) {
      console.log(error)
    }
  }

  // Derived filtered tasks
  const filteredTasks = tasks.filter(task => {
    if (filter === "completed") return task.completed
    if (filter === "pending") return !task.completed
    return true
  })

  return (
    <div className="dashboard">
      <h2>Your Tasks</h2>

      {/* Create Task */}
      <TaskForm onTaskCreated={handleTaskCreated} />

      {/* Filter Buttons */}
      <div className="filter-buttons">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All
        </button>

        <button
          className={filter === "completed" ? "active" : ""}
          onClick={() => setFilter("completed")}
        >
          Completed
        </button>

        <button
          className={filter === "pending" ? "active" : ""}
          onClick={() => setFilter("pending")}
        >
          Pending
        </button>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <p>No tasks found.</p>
      ) : (
          filteredTasks.filter(task => task && task._id)
          .map(task => (
          <TaskItem
            key={task._id}
            task={task}
            onDelete={handleDelete}
            onToggle={handleToggle}
            onUpdate={handleUpdate}
          />
        ))
      )}
    </div>
  )
}

export default Dashboard
