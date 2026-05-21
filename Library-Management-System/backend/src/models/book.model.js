import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      required: true,
    },
    isbn: {
      type: String,
      unique: true,
      required: [true, "ISBN-13 is required"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    publisher: {
      type: String,
    },
    publishedYear: {
      type: Number,
      min: 1000, // 4-digit year
      max: new Date().getFullYear(),
    },
    description: {
      type: String,
    },
    coverImage: {
      type: String,
    },
    totalCopies: {
      type: Number,
      required: true,
      min: 1,
    },
    availableCopies: {
      type: Number, // computed / Copies not currently issued
    },
    language: {
      type: String,
      default: "English",
    },
    pages: {
      type: Number,
    },
    location: {
      type: String, // Shelf / rack reference
    },
    tags: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// availableCopies needs a pre-save hook — right now it has no default, so a newly created book would have availableCopies: undefined. On first save it should mirror totalCopies
bookSchema.pre("save", function (next) {
  if (this.isNew) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

export const Book = mongoose.model("Book", bookSchema);
