const Joi = require("joi");

const postValidate = (payload) => {
  const postSchema = Joi.object({
    title: Joi.string().trim().min(3).max(255).required().messages({
      "string.empty": "Post title cannot be empty.",
      "string.min": "Post title must be at least 3 characters long.",
      "string.max": "Post title cannot exceed 255 characters.",
      "any.required": "Post title is required.",
    }),
    content: Joi.string().trim().min(3).optional().messages({
      "string.empty": "Post content cannot be empty.",
      "string.min": "Post content must be at least 3 characters long.",
    }),
    category_id: Joi.string().uuid().required().messages({
      "string.empty": "Category ID cannot be empty.",
      "string.uuid": "Category ID must be a valid UUID.",
      "any.required": "Category ID is required.",
    }),
  });

  return postSchema.validate(payload, { abortEarly: false });
};

module.exports = postValidate;
