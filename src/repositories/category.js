"use strict";

const { Op } = require("sequelize");
const { Category } = require("../models");

/**
 * Repository class for managing categories.
 */
class CategoryRepository {
  /**
   * Finds a category by its slug.
   * @param {string} slug - The slug of the category.
   * @returns {Promise<Object|null>} The category or null if not found.
   */
  static async findCategoryBySlug(slug) {
    return await Category.findOne({ where: { slug } });
  }

  /**
   * Creates a new category.
   * @param {Object} payload - The category data.
   * @returns {Promise<Object>} The created category.
   */
  static async createCategory(payload) {
    return await Category.create(payload);
  }

  /**
   * Finds a category by its ID.
   * @param {string} id - The ID of the category.
   * @returns {Promise<Object|null>} The category or null if not found.
   */
  static async findCategoryById(id) {
    return await Category.findByPk(id);
  }

  /**
   * Updates a category by its ID.
   * @param {string} id - The ID of the category.
   * @param {Object} payload - The updated category data.
   * @returns {Promise<Object|null>} The updated category or null if not found.
   */
  static async updateCategory(id, payload) {
    const [updatedCount] = await Category.update(payload, { where: { id } });

    if (!updatedCount) return null;

    return await Category.findByPk(id);
  }

  /**
   * Deletes a category by its ID.
   * @param {string} id - The ID of the category.
   * @returns {Promise<boolean>} True if the category was deleted, false otherwise.
   */
  static async deleteCategory(id) {
    const deletedCount = await Category.destroy({ where: { id } });

    return deletedCount > 0;
  }

  /**
   * Finds all categories with pagination and filtering options.
   * @param {Object} options - The query options.
   * @param {number} options.page - The page number.
   * @param {number} options.limit - The number of items per page.
   * @param {string} options.orderby - The field to order by.
   * @param {string} options.sortby - The sort order (asc or desc).
   * @param {string} [options.keyword] - The keyword to filter by.
   * @returns {Promise<Object>} The paginated categories.
   */
  static async findAllCategories({ page, limit, orderby, sortby, keyword }) {
    let query = {};

    if (keyword) {
      query.name = { [Op.iLike]: `%${keyword}%` };
    }
    console.log(keyword);

    const queries = {
      offset: (page - 1) * limit,
      limit,
      order: [[orderby, sortby]],
      where: query,
    };

    const data = await Category.findAndCountAll(queries);

    return {
      total_pages: Math.ceil(data.count / limit),
      total_items: data.count,
      data: data.rows,
    };
  }
}

module.exports = CategoryRepository;
