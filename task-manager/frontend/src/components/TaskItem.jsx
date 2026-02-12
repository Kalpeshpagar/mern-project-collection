import { useState } from "react"
import "../styles/dashboard.css"

const TaskItem = ({ task, onDelete, onToggle, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDescription, setEditDescription] = useState(task.description)

  const handleSave = () => {
    if (!editTitle.trim()) return

    onUpdate(task._id, {
      title: editTitle,
      description: editDescription
    })

    setIsEditing(false)
  }

  return (
    <div className={`task-card ${task.completed ? "completed" : ""}`}>
      {isEditing ? (
        <>
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <input
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />

          <div className="task-actions">
            <button onClick={handleSave}>Save</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </>
      ) : (
        <>
          <h4>{task.title}</h4>
          <p>{task.description}</p>

          <div className="task-actions">
            <button onClick={() => onToggle(task._id)}>
              {task.completed ? "Undo" : "Complete"}
            </button>

            <button onClick={() => setIsEditing(true)}>
              Edit
            </button>

            <button
              className="danger"
              onClick={() => onDelete(task._id)}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default TaskItem
