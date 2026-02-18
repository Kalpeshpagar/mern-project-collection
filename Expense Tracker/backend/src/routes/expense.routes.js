import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getMonthlyExpenseSummary,
  getDashboardData
} from "../controllers/expense.controller.js";

import {
  createExpenseSchema,
  updateExpenseSchema
} from "../validations/expense.validation.js";

const router = express.Router();

// protect all expense routes
router.use(verifyJWT);

// create expense
router.post("/", validate(createExpenseSchema), createExpense);

// get expenses (pagination)
router.get("/", getExpenses);

// get single expense by id
router.get("/:id", getExpenseById);

// update expense
router.patch("/:id", validate(updateExpenseSchema), updateExpense);

// delete expense
router.delete("/:id", deleteExpense);

// monthly summary
router.get("/summary/monthly", getMonthlyExpenseSummary);

// dashboard data
router.get("/dashboard", getDashboardData);

export default router;



/**
 * POST    /api/v1/expenses
    GET     /api/v1/expenses?page=1&limit=10
    GET     /api/v1/expenses/65f...
    PATCH   /api/v1/expenses/65f...
    DELETE  /api/v1/expenses/65f...
    GET     /api/v1/expenses/summary/monthly?month=8&year=2024
    GET     /api/v1/expenses/dashboard?month=8&year=2024

 */