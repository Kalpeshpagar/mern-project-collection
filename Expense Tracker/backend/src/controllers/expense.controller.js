import mongoose from "mongoose";
import Expense from "../models/expense.model.js";
import Category from "../models/category.model.js";
import User from "../models/user.model.js"

const createExpense = async (req, res) => {
  try {
    const { amount, category, expenseDate, note } = req.body;

    // Check category exists & belongs to user
    const categoryExists = await Category.findOne({
      _id: category,
      user: req.user._id
    });

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    // Create expense
    const expense = await Expense.create({
      amount: mongoose.Types.Decimal128.fromString(amount.toString()),
      category,
      expenseDate,
      note,
      user: req.user._id
    });

    return res.status(201).json({
      success: true,
      message: "Expense created successfully",
      data: expense
    });

  } catch (error) {
    console.error("Create expense error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create expense"
    });
  }
};

const getExpenses = async (req, res) => {
  try {
    // Read query params with defaults
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);

    const skip = (page - 1) * limit;

    // Fetch expenses (user-scoped)
    const expenses = await Expense.find({ user: req.user._id })
      .populate("category", "name")
      .sort({ expenseDate: -1 })
      .skip(skip)
      .limit(limit);

    // Total count (for frontend pagination UI)
    const totalExpenses = await Expense.countDocuments({
      user: req.user._id
    });

    // Pagination meta
    const totalPages = Math.ceil(totalExpenses / limit);

    return res.status(200).json({
      success: true,
      message: "Expenses fetched successfully",
      data: expenses,
      pagination: {
        totalItems: totalExpenses,
        totalPages,
        currentPage: page,
        limit
      }
    });

  } catch (error) {
    console.error("Fetch expenses error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch expenses"
    });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find expense by id + user (ownership enforced)
    const expense = await Expense.findOne({
      _id: id,
      user: req.user._id
    }).populate("category", "name");

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: expense
    });

  } catch (error) {
    console.error("Get expense by id error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch expense"
    });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, category, expenseDate, note } = req.body;

    // Find expense & enforce ownership
    const expense = await Expense.findOne({
      _id: id,
      user: req.user._id
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

    // If category provided, validate ownership
    if (category) {
      const categoryExists = await Category.findOne({
        _id: category,
        user: req.user._id
      });

      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Category not found"
        });
      }

      expense.category = category;
    }

    // Update only provided fields
    if (amount !== undefined) {
      expense.amount = mongoose.Types.Decimal128.fromString(
        amount.toString()
      );
    }

    if (expenseDate) {
      expense.expenseDate = expenseDate;
    }

    if (note !== undefined) {
      expense.note = note;
    }

    await expense.save();

    return res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: expense
    });

  } catch (error) {
    console.error("Expense update error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update expense"
    });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findOne({
      _id: id,
      user: req.user._id
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

    await expense.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully"
    });

  } catch (error) {
    console.error("Expense delete error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete expense"
    });
  }
};

const getMonthlyExpenseSummary = async (req, res) => {
  try {
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Month and year are required"
      });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const summary = await Expense.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
          expenseDate: {                    // Filters only current user
            $gte: startDate,                // Filters only selected month
            $lt: endDate
          }
        }
      },
      {
        $group: {
          _id: "$category",                 // Groups expenses by category
          totalAmount: { $sum: "$amount" }
        }
      },
      {
        $lookup: {
          from: "categories",           // Joins category collection to fetch names.
          localField: "_id",
          foreignField: "_id",
          as: "category"
        }
      },
      { $unwind: "$category" },
      {
        $project: {
          _id: 0,
          categoryId: "$category._id",
          categoryName: "$category.name",
          totalAmount: { $toString: "$totalAmount" }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    return res.status(200).json({
      success: true,
      month,
      year,
      data: summary
    });

  } catch (error) {
    console.error("Monthly summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch monthly expense summary"
    });
  }
};


const getDashboardData = async (req, res) => {
  try {
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Month and year are required"
      });
    }

    const userId = new mongoose.Types.ObjectId(req.user._id);

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 1);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Total expense this month
    const monthlyTotal = await Expense.aggregate([
      {
        $match: {
          user: userId,
          expenseDate: { $gte: startOfMonth, $lt: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    // Today's expense
    const todayTotal = await Expense.aggregate([
      {
        $match: {
          user: userId,
          expenseDate: { $gte: startOfToday }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    // Top categories (this month)
    const topCategories = await Expense.aggregate([
      {
        $match: {
          user: userId,
          expenseDate: { $gte: startOfMonth, $lt: endOfMonth }
        }
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category"
        }
      },
      { $unwind: "$category" },
      {
        $project: {
          categoryName: "$category.name",
          total: { $toString: "$total" }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);

    //  Recent expenses
    const recentExpenses = await Expense.find({ user: userId })
      .sort({ expenseDate: -1 })
      .limit(5)
      .populate("category", "name");

    //  Monthly trend (day-wise)
    const monthlyTrend = await Expense.aggregate([
      {
        $match: {
          user: userId,
          expenseDate: { $gte: startOfMonth, $lt: endOfMonth }
        }
      },
      {
        $group: {
          _id: { $dayOfMonth: "$expenseDate" },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalMonthExpense: monthlyTotal[0]?.total?.toString() || "0",
        todayExpense: todayTotal[0]?.total?.toString() || "0",
        topCategories,
        recentExpenses,
        monthlyTrend
      }
    });

  } catch (error) {
    console.error("Dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data"
    });
  }
};


export {
    createExpense,
    getExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense,
    getMonthlyExpenseSummary,
    getDashboardData
};
