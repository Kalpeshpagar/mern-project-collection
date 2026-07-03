import mongoose from "mongoose";

const fineSchema = mongoose.Schema(
  {
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true, min: 0 }, // ← min: 0 prevents negatives
    perDayRate: { type: Number, required: true },
    daysOverdue: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "waived"],
      required: true,
      default: "pending", // ← every new fine starts as pending
    },
    paidAt: { type: Date, default: null }, // ← explicit null = not yet paid
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    waivedReason: { type: String }
  },
  
  { timestamps: true }
);

export const Fine = mongoose.model("Fine", fineSchema);
