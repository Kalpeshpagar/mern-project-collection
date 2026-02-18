import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    expenseDate: {              
      type: Date,
      required: true,
      default: Date.now
    },

    note: {
      type: String,
      trim: true,
      maxlength: 200
    }
  },
  { timestamps: true }
);

// Indexes for performance
expenseSchema.index({ user: 1, expenseDate: -1 });
expenseSchema.index({ user: 1, category: 1 });

export default mongoose.model("Expense", expenseSchema);
