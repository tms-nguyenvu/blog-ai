const Joi = require("joi");

const categoryValidate = (payload) => {
  const categorySchema = Joi.object({
    name: Joi.string().trim().min(3).max(100).required().messages({
      "string.empty": "Category name cannot be empty.",
      "string.min": "Category name must be at least 3 characters long.",
      "string.max": "Category name cannot exceed 100 characters.",
      "any.required": "Category name is required.",
    }),
    description: Joi.string().trim().max(500).optional().messages({
      "string.max": "Description cannot exceed 500 characters.",
    }),
    slug: Joi.string().trim().lowercase().max(255).optional().messages({
      "string.max": "Slug cannot exceed 255 characters.",
    }),
  });

  return categorySchema.validate(payload, { abortEarly: false });
};

module.exports = categoryValidate;
