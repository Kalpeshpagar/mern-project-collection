import Joi from "joi";

/**
 * CREATE EXPENSE
 */
export const createExpenseSchema = Joi.object({
  amount: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      "number.base": "Amount must be a number",
      "number.positive": "Amount must be greater than zero",
      "any.required": "Amount is required"
    }),

  category: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      "string.length": "Invalid category ID",
      "any.required": "Category is required"
    }),

  expenseDate: Joi.date()
    .required()
    .messages({
      "date.base": "Expense date must be a valid date",
      "any.required": "Expense date is required"
    }),

  note: Joi.string()
    .trim()
    .max(200)
    .allow("")
    .messages({
      "string.max": "Note must be at most 200 characters"
    })
});


/**
 * UPDATE EXPENSE
 * (all fields optional, but at least one must be provided)
 */
export const updateExpenseSchema = Joi.object({
  amount: Joi.number()
    .positive()
    .precision(2)
    .messages({
      "number.base": "Amount must be a number",
      "number.positive": "Amount must be greater than zero"
    }),

  category: Joi.string()
    .hex()
    .length(24)
    .messages({
      "string.length": "Invalid category ID"
    }),

  expenseDate: Joi.date()
    .messages({
      "date.base": "Expense date must be a valid date"
    }),

  note: Joi.string()
    .trim()
    .max(200)
    .allow("")
}).min(1); // at least one field required
