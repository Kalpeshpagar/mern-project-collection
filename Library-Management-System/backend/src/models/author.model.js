import mongoose from "mongoose";

const authorSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Author full name is required"],
    },
    bio: {
      type: String,
    },
    photo: {
      type: String, // Author photo url
    },
    country: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Author = mongoose.model("Author", authorSchema);
