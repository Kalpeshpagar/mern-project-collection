const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false, // collect all errors, not just first
      allowUnknown: false // block extra fields
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);

      return res.status(400).json({
        success: false,
        message: errors.join(", "),
        errors
      });
    }

    next();
  };
};

export default validate;
