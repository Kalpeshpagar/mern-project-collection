import mongoose from "mongoose";

const categorySchema = mongoose.Schema(
  {
    name: {          // e.g. Fiction, Science
      type: String,
      unique: true,
      required: [true, "Category name is required"],
    },
    description: { type: String },
  },
  { timestamps: true }
);

export const Category = mongoose.model("Category", categorySchema);
