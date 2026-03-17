import { useEffect, useState } from "react";
import { createCategory, getCategories } from "../api/category.api";
import { useAuth } from "../context/AuthContext";
import CategoryItem from "../components/CategoryItem";
import toast from "react-hot-toast";
import "../styles/categories.css";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

 const { setHasCategories } = useAuth();


  const fetchCategories = async () => {
  setLoading(true);
  try {
    const res = await getCategories();
    const list = res.data.data || [];
    setCategories(list);
    setHasCategories(list.length > 0); 
  } catch {
    
  } finally {
    setLoading(false);
  }
};





  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;

    try {
      await createCategory({ name });
      toast.success("Category created");
      setName("");
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Category exists");
    }
  };

  return (
    <div className="categories-page">
      <h1>Categories</h1>

      <div className="category-create">
        <input
          placeholder="New category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={handleCreate}>Add</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : categories.length === 0 ? (
        <p className="empty">No categories yet</p>
      ) : (
        <ul className="category-list">
          {categories.map((cat) => (
            <CategoryItem
              key={cat._id}
              category={cat}
              onUpdated={() => {
                fetchCategories();
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default Categories;
