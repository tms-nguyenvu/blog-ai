"use strict";

const createHttpError = require("http-errors");
const categoryValidate = require("../validators/category");
const CategoryRepository = require("../repositories/category");
const { generateSlug } = require("../utils/util");

/**
 * Service class for managing categories.
 */
class CategoryService {
  /**
   * Creates a new category.
   * @param {Object} payload - The category data.
   * @param {string} payload.name - The name of the category.
   * @param {string} [payload.description] - The description of the category.
   * @param {string} [payload.slug] - The slug of the category.
   * @returns {Promise<Object>} The created category.
   * @throws {createHttpError.BadRequest} If validation fails.
   * @throws {createHttpError.Conflict} If the category already exists.
   */
  static async createCategory(payload) {
    const { error } = categoryValidate(payload);
    if (error) throw createHttpError.BadRequest(error.details[0].message);

    let finalSlug = generateSlug(payload.name);

    const existingCategory = await CategoryRepository.findCategoryBySlug(
      finalSlug
    );
    if (existingCategory)
      throw createHttpError.Conflict("Category already exists.");

    const createdCategory = await CategoryRepository.createCategory({
      ...payload,
      slug: finalSlug,
    });
    return createdCategory;
  }

  /**
   * Retrieves a category by its ID.
   * @param {string} params - The ID of the category.
   * @returns {Promise<Object>} The category.
   * @throws {createHttpError.NotFound} If the category is not found.
   */
  static async getCategoryById(params) {
    const category = await CategoryRepository.findCategoryById(params);
    if (!category) throw createHttpError.NotFound("Category not found.");

    return category;
  }

  /**
   * Updates a category by its ID.
   * @param {string} params - The ID of the category.
   * @param {Object} payload - The updated category data.
   * @returns {Promise<Object>} The updated category.
   * @throws {createHttpError.BadRequest} If validation fails.
   * @throws {createHttpError.NotFound} If the category is not found.
   */
  static async updateCategory(params, payload) {
    const { error } = categoryValidate(payload);
    if (error) throw createHttpError.BadRequest(error.details[0].message);

    const existingCategory = await CategoryRepository.findCategoryById(params);
    if (!existingCategory)
      throw createHttpError.NotFound("Category not found.");

    const updatedCategory = await CategoryRepository.updateCategory(
      existingCategory.id,
      payload
    );
    return updatedCategory;
  }

  /**
   * Deletes a category by its ID.
   * @param {string} params - The ID of the category.
   * @returns {Promise<void>}
   * @throws {createHttpError.NotFound} If the category is not found.
   */
  static async deleteCategory(params) {
    const existingCategory = await CategoryRepository.findCategoryById(params);
    if (!existingCategory)
      throw createHttpError.NotFound("Category not found.");

    await CategoryRepository.deleteCategory(existingCategory.id);
  }

  /**
   * Retrieves all categories with pagination and filtering options.
   * @param {Object} query - The query parameters.
   * @param {number} [query.page=1] - The page number.
   * @param {number} [query.limit=10] - The number of items per page.
   * @param {string} [query.orderby="name"] - The field to order by.
   * @param {string} [query.sortby="asc"] - The sort order (asc or desc).
   * @param {string} [query.keyword] - The keyword to filter by.
   * @returns {Promise<Object>} The paginated categories.
   */
  static async getAllCategories(query) {
    const {
      page = 1,
      limit = 10,
      orderby = "name",
      sortby = "asc",
      keyword,
    } = query;
    const category = await CategoryRepository.findAllCategories({
      page: +page ? +page : 1,
      limit: +limit ? +limit : 10,
      orderby: orderby,
      sortby: sortby,
      keyword: keyword,
    });
    return category;
  }
}

module.exports = CategoryService;
