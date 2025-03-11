"use strict";

const CategoryService = require("../services/category");
const { CREATED, OK } = require("../middlewares/success.response");

class CategoryController {
  createCategory = async (req, res, next) => {
    return new CREATED({
      message: "Category created successfully",
      metadata: await CategoryService.createCategory(req.body),
    }).send(res);
  };

  getCategoryById = async (req, res, next) => {
    return new OK({
      message: "Get category successfully",
      metadata: await CategoryService.getCategoryById(req.params.id),
    }).send(res);
  };

  updateCategory = async (req, res, next) => {
    return new OK({
      message: "Category updated successfully",
      metadata: await CategoryService.updateCategory(req.params.id, req.body),
    }).send(res);
  };

  deleteCategory = async (req, res, next) => {
    await CategoryService.deleteCategory(req.params.id);
    return new OK({
      message: "Category deleted successfully",
    }).send(res);
  };

  getAllCategories = async (req, res, next) => {
    return new OK({
      message: "Get all categories successfully",
      metadata: await CategoryService.getAllCategories(req.query),
    }).send(res);
  };
}

module.exports = new CategoryController();
