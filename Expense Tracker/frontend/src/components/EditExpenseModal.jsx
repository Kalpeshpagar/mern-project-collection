import { useEffect, useState } from "react";
import { updateExpense } from "../api/expense.api";
import { getCategories } from "../api/category.api";
import toast from "react-hot-toast";
import "../styles/form.css";      
import "../styles/modal.css";     

const EditExpenseModal = ({ expense, onClose, onUpdated }) => {
  const [form, setForm] = useState({
    amount: "",
    category: "",
    expenseDate: "",
    note: ""
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!expense) return;

    // Handle Decimal safely
    const amountValue =
      typeof expense.amount === "object"
        ? expense.amount?.$numberDecimal
        : expense.amount;

    setForm({
      amount: amountValue || "",
      category: expense.category?._id || "",
      expenseDate: expense.expenseDate
        ? expense.expenseDate.split("T")[0]
        : "",
      note: expense.note || ""
    });

    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        setCategories(res.data.data || []);
      } catch {
        toast.error("Failed to load categories");
        setCategories([]);
      }
    };

    fetchCategories();
  }, [expense]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateExpense(expense._id, form);
      toast.success("Expense updated successfully");
      onUpdated();
      onClose();
    } catch (error) {
      toast.error("Failed to update expense");
    } finally {
      setLoading(false);
    }
  };

  if (!expense) return null;

  return (
    <div className="modal-backdrop">
      <div className="form-container">
        <h2>Edit Expense</h2>

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
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
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

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
            >
              {loading ? "Saving..." : "Update Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExpenseModal;