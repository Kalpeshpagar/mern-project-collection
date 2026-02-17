import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  createCategorySchema,
  updateCategorySchema
} from "../validations/category.validation.js";

import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
} from "../controllers/category.controller.js";

const router = express.Router();

// protect all category routes
router.use(verifyJWT);

// create category
router.post("/", validate(createCategorySchema), createCategory);

// get all categories
router.get("/", getCategories);

// update category
router.patch("/:id", validate(updateCategorySchema), updateCategory);

// delete category
router.delete("/:id", deleteCategory);

export default router;
