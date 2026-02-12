import { useState } from "react"
import { createTask } from "../api/task.api"
import "../styles/dashboard.css"

const TaskForm = ({ onTaskCreated }) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim()) return

    try {
      setLoading(true)

      const res = await createTask({
        title,
        description
      })


      // Send new task back to Dashboard
      onTaskCreated(res.data.task)

      setTitle("")
      setDescription("")
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <input
        type="text"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="text"
        placeholder="Task description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Task"}
      </button>
    </form>
  )
}

export default TaskForm
