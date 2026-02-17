import Joi from "joi";

/**
 * REGISTER VALIDATION
 * - name: required, readable length
 * - email: valid email format
 * - password: strong enough for real apps
 */
export const registerSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(50)
    .required()
    .messages({
      "string.empty": "Name is required",
      "string.min": "Name must be at least 3 characters",
      "string.max": "Name must be at most 50 characters"
    }),

  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.empty": "Email is required",
      "string.email": "Please enter a valid email address"
    }),

  password: Joi.string()
    .min(6)
    .max(30)
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 6 characters",
      "string.max": "Password must be at most 30 characters"
    })
});

/**
 * LOGIN VALIDATION
 * - email + password only
 */
export const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.empty": "Email is required",
      "string.email": "Please enter a valid email address"
    }),

  password: Joi.string()
    .required()
    .messages({
      "string.empty": "Password is required"
    })
});
