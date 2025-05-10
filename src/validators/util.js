"use strict";

const Joi = require("joi");

const idValidate = (keyName, payload) => {
  const schema = Joi.object({
    [keyName]: Joi.string().uuid({ version: "uuidv4" }).required().messages({
      "string.empty": "Category ID cannot be empty.",
      "string.uuid": "Category ID is invalid.",
      "any.required": "Category ID is required.",
    }),
  });

  return schema.validate(payload, { abortEarly: false });
};

module.exports = idValidate;
