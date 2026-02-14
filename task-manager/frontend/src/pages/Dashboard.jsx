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
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 2
  const [search, setSearch] = useState("")
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState("all")

  // Fetch tasks with search and pagination
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await getAllTasks({
          page,
          limit,
          search
        })

        setTasks(res.data.tasks || [])
        setTotalPages(res.data.totalPages || 1)
      } catch (error) {
        console.log(error)
      }
    }

    const delay = setTimeout(fetchTasks, 500) // debounce for search
    return () => clearTimeout(delay)

  }, [page, search])

  // If user is on page 4 and searches, page 4 may not exist.
  useEffect(() => {
    setPage(1)
  }, [search])



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

      <input
        type="text"
        placeholder="Search tasks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />


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
      {/* pagination */}
      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() => setPage(prev => prev - 1)}
        >
          Prev
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(prev => prev + 1)}
        >
          Next
        </button>
      </div>

    </div>
  )
}

export default Dashboard
