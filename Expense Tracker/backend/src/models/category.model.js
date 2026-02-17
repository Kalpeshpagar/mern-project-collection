import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
      // stored in lowercase to avoid case-duplicate categories
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
      // category always belongs to a user
    }
  },
  {
    timestamps: true
  }
);

/**
 * Prevent duplicate category names per user.
 * Same user cannot have two categories with same name.
 * Different users CAN have same category name.
 */
categorySchema.index({ name: 1, user: 1 }, { unique: true });

const Category = mongoose.model("Category", categorySchema);

export default Category;
