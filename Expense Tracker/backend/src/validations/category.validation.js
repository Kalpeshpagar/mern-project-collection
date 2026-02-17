import Joi from "joi";

/**
 * Category name rules (senior reasoning):
 * - Required
 * - String
 * - Trimmed
 * - Allow letters + numbers + spaces
 * - Minimum length: 2 (avoid "a")
 * - Maximum length: 30 (reasonable UI limit)
 */

export const createCategorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(30)
    .pattern(/^[a-zA-Z0-9 ]+$/)
    .required()
    .messages({
      "string.empty": "Category name is required",
      "string.min": "Category name must be at least 2 characters",
      "string.max": "Category name must be at most 30 characters",
      "string.pattern.base":
        "Category name can contain only letters, numbers and spaces"
    })
});

export const updateCategorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(30)
    .pattern(/^[a-zA-Z0-9 ]+$/)
    .required()
    .messages({
      "string.empty": "Category name is required",
      "string.min": "Category name must be at least 2 characters",
      "string.max": "Category name must be at most 30 characters",
      "string.pattern.base":
        "Category name can contain only letters, numbers and spaces"
    })
});
