const RecentExpenses = ({ expenses }) => {
  return (
    <table className="expense-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Category</th>
          <th>Amount</th>
          <th>Note</th>
        </tr>
      </thead>
      <tbody>
        {expenses.map((exp) => (
          <tr key={exp._id}>
            <td>{new Date(exp.expenseDate).toLocaleDateString()}</td>
            <td>{exp.category?.name}</td>
            <td>₹ {exp.amount}</td>
            <td>{exp.note || "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RecentExpenses;
