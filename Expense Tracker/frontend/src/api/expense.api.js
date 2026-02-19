import api from "./axios";

// create expense
export const createExpense = (data) => {
  return api.post("/expenses", data);
};

// get expenses (pagination)
export const getExpenses = (params) => {
  return api.get("/expenses", { params });
};


// get expense by id
export const getExpenseById = (id) => {
  return api.get(`/expenses/${id}`);
};

// update expense
export const updateExpense = (id, data) => {
  return api.patch(`/expenses/${id}`, data);
};

// delete expense
export const deleteExpense = (id) => {
  return api.delete(`/expenses/${id}`);
};

// monthly summary
export const getMonthlySummary = (month, year) => {
  return api.get(
    `/expenses/summary/monthly?month=${month}&year=${year}`
  );
};

// dashboard data
export const getDashboardData = (month, year) => {
  return api.get(
    `/expenses/dashboard?month=${month}&year=${year}`
  );
};
