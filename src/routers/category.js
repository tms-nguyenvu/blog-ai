"use strict";

const express = require("express");
const router = express.Router();
const asyncHandler = require("../middlewares/async.handler");
const categoryController = require("../controllers/category");

router.get("/", asyncHandler(categoryController.getAllCategories));
router.get("/:id", asyncHandler(categoryController.getCategoryById));
router.post("/", asyncHandler(categoryController.createCategory));
router.put("/:id", asyncHandler(categoryController.updateCategory));
router.delete("/:id", asyncHandler(categoryController.deleteCategory));

module.exports = router;
