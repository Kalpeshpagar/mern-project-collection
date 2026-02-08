import Task from '../models/task.model.js';

const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Basic validation
    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Create task with user reference
    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
      user: req.user.id  
    }).populate('user', 'name email'); 

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

const getAllTasks = async (req, res) => {
  try {
      const tasks = await Task.find({ user: req.user.id })
          .populate('user', 'name email');  

    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ success: false, message: "No tasks found for this user" });
    }

    return res.status(200).json({ success: true, tasks });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

const updateTask = async (req, res) => {
    try {
        const { id } = req.params
        const { title, description } = req.body
        
        const task = await Task.findById(id)

        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        if (task.user.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Not authorized to update this task" });
        }

        // update fields
        task.title = title;
        task.description = description;

        const updatedTask = await task.save()
        return res.status(200).json({ success: true, task: updatedTask });
        }
    catch (error) {
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
}

const deleteTask = async (req, res) => {
    try {
        const { id } = req.params
        
        const task = await Task.findById(id)
        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" }); 
        }

        if (task.user.toString() !== req.user.id) {
             return res.status(403).json({ success: false, message: "Not authorized to update this task" });
        }

        await Task.findByIdAndDelete(id);

        return res.status(200).json({success:true, message:"Task deleted successfully"})
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
}

// Delete all tasks belonging to the logged-in user
const deleteAllTasks = async (req, res) => {
  try {
    const result = await Task.deleteMany({ user: req.user.id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "No tasks found to delete" });
    }

    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} tasks deleted successfully`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// mark task as complete
const toggleTaskCompletion = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to update this task" });
    }

    // Toggle the completed field
    task.completed = !task.completed;

    const updatedTask = await task.save();

    return res.status(200).json({
      success: true,
      message: `Task marked as ${updatedTask.completed ? "completed" : "incomplete"}`,
      task: updatedTask
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};



export { createTask, getAllTasks, updateTask, deleteTask, deleteAllTasks, toggleTaskCompletion };
