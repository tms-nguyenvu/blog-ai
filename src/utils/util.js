"use strict";

const { default: slugify } = require("slugify");

const generateSlug = (title) => {
  return slugify(title, {
    lower: true,
    strict: true,
    replacement: "-",
  });
};

module.exports = { generateSlug };
