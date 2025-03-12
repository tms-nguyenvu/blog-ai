"use strict";

const { Op } = require("sequelize");
const { Post } = require("../models");

/**
 * Repository class for managing posts.
 */
class PostRepository {
  /**
   * Creates a new post.
   * @param {Object} payload - The post data.
   * @returns {Promise<Object>} The created post.
   */
  static async createPost(payload) {
    return await Post.create(payload);
  }

  /**
   * Finds all posts with pagination and filtering options.
   * @param {Object} options - The query options.
   * @param {number} options.page - The page number.
   * @param {number} options.limit - The number of items per page.
   * @param {string} options.orderby - The field to order by.
   * @param {string} options.sortby - The sort order (asc or desc).
   * @param {string} [options.keyword] - The keyword to filter by.
   * @returns {Promise<Object>} The paginated posts.
   */
  static async findAllPost({ page, limit, orderby, sortby, keyword }) {
    let query = {};
    if (keyword) {
      query.normalized_title = { [Op.iLike]: `%${keyword}%` };
    }

    const queries = {
      offset: (page - 1) * limit,
      limit,
      order: [[orderby, sortby]],
      where: query,
    };

    const data = await Post.findAndCountAll(queries);
    return {
      total_pages: Math.ceil(data.count / limit),
      total_items: data.count,
      data: data.rows,
    };
  }

  /**
   * Finds a post by its ID.
   * @param {string} id - The ID of the post.
   * @returns {Promise<Object|null>} The post or null if not found.
   */
  static async findPostById(id) {
    return await Post.findByPk(id);
  }

  /**
   * Updates a post by its ID.
   * @param {string} id - The ID of the post.
   * @param {Object} payload - The updated post data.
   * @returns {Promise<Object|null>} The updated post or null if not found.
   */
  static async updatePost(id, payload) {
    const [updatedCount] = await Post.update(payload, { where: { id } });

    if (!updatedCount) return null;

    return await Post.findByPk(id);
  }

  /**
   * Deletes a post by its ID.
   * @param {string} id - The ID of the post.
   * @returns {Promise<boolean>} True if the post was deleted, false otherwise.
   */
  static async deletePost(id) {
    const deletedCount = await Post.destroy({ where: { id } });

    return deletedCount > 0;
  }
}

module.exports = PostRepository;
