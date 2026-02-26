import { useState } from "react";
import EditExpenseModal from "./EditExpenseModal";

const ExpenseRow = ({ expense, onDelete, onUpdated }) => {
  const [editing, setEditing] = useState(false);

  return (
    <>
      <tr>
        <td>{new Date(expense.expenseDate).toLocaleDateString()}</td>
        <td>{expense.category?.name}</td>
        <td>{expense.note || "-"}</td>
        <td>{expense.amount}</td>
        <td className="actions">
          <button onClick={() => setEditing(true)}>Edit</button>
          <button
            className="delete-btn"
            onClick={() => onDelete(expense._id)}
          >
            Delete
          </button>
        </td>
      </tr>

      {editing && (
        <EditExpenseModal
          expense={expense}
          onClose={() => setEditing(false)}
          onUpdated={onUpdated}
        />
      )}
    </>
  );
};

export default ExpenseRow;
