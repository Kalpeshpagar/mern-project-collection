import { useState } from "react";
import { updateCategory, deleteCategory } from "../api/category.api";
import toast from "react-hot-toast";

const CategoryItem = ({ category, onUpdated }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);

  const handleUpdate = async () => {
    try {
      await updateCategory(category._id, { name });
      toast.success("Category updated");
      setEditing(false);
      onUpdated();
    } catch {
      toast.error("Update failed");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this category?")) return;

    try {
      await deleteCategory(category._id);
      toast.success("Category deleted");
      onUpdated();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        "Cannot delete category in use"
      );
    }
  };

  return (
    <li className="category-item">
      {editing ? (
        <>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={handleUpdate}>Save</button>
          <button onClick={() => setEditing(false)}>Cancel</button>
        </>
      ) : (
        <>
          <span>{category.name}</span>
          <div className="actions">
            <button onClick={() => setEditing(true)}>Edit</button>
            <button className="danger" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </>
      )}
    </li>
  );
};

export default CategoryItem;
