import { useEffect, useState } from "react";
import { getExpenses, deleteExpense } from "../api/expense.api";
import Pagination from "../components/Pagination";
import ExpenseRow from "../components/ExpenseRow";
import "../styles/expenses.css";
import toast from "react-hot-toast";
import Loader from "../components/Loader";

const Expenses = () => {
    const [filters, setFilters] = useState({
  search: "",
  category: "",
  startDate: "",
  endDate: ""
});

  const [expenses, setExpenses] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async (p = page) => {
  try {
    setLoading(true);
    const res = await getExpenses({
      page: p,
      limit,
      ...filters
    });
    setExpenses(res.data.data);
    setPagination(res.data.pagination);
    setPage(p);
  } catch (err) {
    toast.error(err);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchExpenses(1);
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this expense?")) return;
      await deleteExpense(id);
      toast.success("Expense deleted");
    fetchExpenses(page);
  };

  if (loading) return <Loader />;

  return (
    <div className="expenses">
          <h1>Expenses</h1>
          
          <div className="filters">
  <input
    type="text"
    placeholder="Search note..."
    value={filters.search}
    onChange={(e) =>
      setFilters({ ...filters, search: e.target.value })
    }
  />

  <input
    type="date"
    value={filters.startDate}
    onChange={(e) =>
      setFilters({ ...filters, startDate: e.target.value })
    }
  />

  <input
    type="date"
    value={filters.endDate}
    onChange={(e) =>
      setFilters({ ...filters, endDate: e.target.value })
    }
  />

  <button onClick={() => fetchExpenses(1)}>Apply</button>
</div>


      <table className="expense-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Note</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {expenses.length === 0 ? (
            <tr>
              <td colSpan="5" className="empty">
                No expenses found
              </td>
            </tr>
          ) : (
            expenses.map((exp) => (
        <ExpenseRow
            key={exp._id}
            expense={exp}
            onDelete={handleDelete}
            onUpdated={() => fetchExpenses(page)}
        />
))
          )}
        </tbody>
      </table>

      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={fetchExpenses}
        />
      )}
    </div>
  );
};

export default Expenses;
