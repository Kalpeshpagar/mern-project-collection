import { useEffect, useState } from "react";
import { getDashboardData } from "../api/expense.api";
import StatCard from "../components/StatCard";
import RecentExpenses from "../components/RecentExpenses";
import MonthlyExpenseChart from "../components/MonthlyExpenseChart";
import CategoryPieChart from "../components/CategoryPieChart";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import "../styles/dashboard.css";

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

const Dashboard = () => {
  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(
    today.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(
    today.getFullYear()
  );

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await getDashboardData(
          selectedMonth,
          selectedYear
        );
        setData(res.data.data);
      } catch (err) {
        toast.error("Failed to load dashboard");
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [selectedMonth, selectedYear]);
    
    const handleExportCSV = () => {
  if (!data || !data.recentExpenses.length) {
    toast.error("No expenses to export");
    return;
  }

  const headers = [
    "Date",
    "Category",
    "Amount",
    "Note"
  ];

  const rows = data.recentExpenses.map((exp) => [
    new Date(exp.expenseDate).toLocaleDateString(),
    exp.category?.name || "",
    exp.amount,
    exp.note || ""
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((v) => `"${v}"`).join(",")
    )
  ].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `expenses-${selectedMonth}-${selectedYear}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


  if (loading) return <Loader />;
  if (error) return <p className="error">{error}</p>;
  if (!data) return null;

  return (
    <div className="dashboard">
      {/* HEADER */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>

        <div className="filters">
          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) =>
              setSelectedMonth(Number(e.target.value))
            }
            className="filter-select"
          >
            {MONTHS.map((month, index) => (
              <option key={month} value={index + 1}>
                {month}
              </option>
            ))}
          </select>

          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) =>
              setSelectedYear(Number(e.target.value))
            }
            className="filter-select"
          >
            {YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
                  </select>
                  
                  <button
  className="export-btn"
  onClick={handleExportCSV}
>
  ⬇ Export CSV
</button>

        </div>
      </div>

      {/* EMPTY STATE */}
      {data.recentExpenses.length === 0 && (
        <p className="empty">
          No expenses yet. Start by adding one 💸
        </p>
      )}

      {/* STAT CARDS */}
      <div className="stats-grid">
        <StatCard
          title="This Month"
          value={`₹ ${data.totalMonthExpense}`}
        />
        <StatCard
          title="Today"
          value={`₹ ${data.todayExpense}`}
        />
      </div>

      {/* CHARTS */}
      <div className="charts-grid">
        <MonthlyExpenseChart
          data={data.monthlyTrend || []}
        />
        <CategoryPieChart
          data={data.topCategories || []}
        />
      </div>

      {/* RECENT EXPENSES */}
      <div className="section">
        <h2>Recent Expenses</h2>
        <RecentExpenses
          expenses={data.recentExpenses || []}
        />
      </div>
    </div>
  );
};

export default Dashboard;
