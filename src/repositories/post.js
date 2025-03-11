"use strict";

const { Op } = require("sequelize");
const { Post } = require("../models");

class PostRepository {
  static async createPost(payload) {
    return await Post.create(payload);
  }

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

  static async findPostById(id) {
    return await Post.findByPk(id);
  }

  static async updatePost(id, payload) {
    const updatedCount = await Post.update(payload, { where: { id } });

    if (!updatedCount) return null;

    return await Post.findByPk(id);
  }

  static async deletePost(id) {
    const deletedCount = await Post.destroy({ where: { id } });

    return deletedCount > 0;
  }
}

module.exports = PostRepository;
