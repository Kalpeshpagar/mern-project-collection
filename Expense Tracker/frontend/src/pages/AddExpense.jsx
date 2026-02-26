import { useEffect, useState } from "react";
import { createExpense } from "../api/expense.api";
import { getCategories } from "../api/category.api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import "../styles/form.css"

const AddExpense = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
    const [submitting, setSubmitting] = useState(false);


  const [form, setForm] = useState({
    amount: "",
    category: "",
    expenseDate: "",
    note: ""
  });

  // Fetch categories
  useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      const list = res.data.data || []; // 🔥 IMPORTANT
      setCategories(list);
    } catch (error) {
      toast.error("Failed to load categories");
      setCategories([]);
    }
  };

  fetchCategories();
}, []);


  // Generic change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (categories.length === 0) {
      toast.error("Please create a category first");
      return;
    }

    try {
      setSubmitting(true);
        await createExpense(form);
      toast.success("Expense added successfully");
      navigate("/expenses");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to add expense"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
  <div className="form-wrapper">
    <div className="form-container">
      <h2>Add Expense</h2>

      {loadingCategories ? (
        <p className="hint">Loading categories...</p>
      ) : categories.length === 0 ? (
        <p className="hint error">
          No categories found. Please create a category first.
        </p>
      ) : null}

      <form onSubmit={handleSubmit}>
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          required
        />

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          required
          disabled={categories.length === 0}
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="expenseDate"
          value={form.expenseDate}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="note"
          placeholder="Note (optional)"
          value={form.note}
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={categories.length === 0 || submitting}
        >
          {submitting ? "Saving..." : "Save Expense"}
        </button>
      </form>
    </div>
  </div>
);
};

export default AddExpense;
