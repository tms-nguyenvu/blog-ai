"use strict";
const createHttpError = require("http-errors");
const removeDiacritics = require("remove-accents");
const PostRepository = require("../repositories/post");
const postValidate = require("../validators/post");
const CategoryRepository = require("../repositories/category");

class PostService {
  static async createPost(payload) {
    const { error } = postValidate(payload);
    if (error) throw createHttpError.BadRequest(error.details[0].message);

    const category = await CategoryRepository.findCategoryById(
      payload.category_id
    );
    if (!category) throw createHttpError.BadRequest("Invalid category");

    if (payload.title) {
      payload.normalized_title = removeDiacritics(payload.title).toLowerCase();
    }

    const post = await PostRepository.createPost(payload);
    return post;
  }

  static async getPosts(query) {
    const {
      page = 1,
      limit = 10,
      orderby = "normalized_title",
      sortby = "asc",
      keyword,
    } = query;
    const posts = await PostRepository.findAllPost({
      page: +page ? +page : 1,
      limit: +limit ? +limit : 1,
      orderby: orderby,
      sortby: sortby,
      keyword: keyword,
    });
    return posts;
  }

  static async getPostById(id) {
    const post = await PostRepository.findPostById(id);
    if (!post) throw createHttpError.NotFound("Post not found");
    return post;
  }

  static async updatePost(id, payload) {
    const { error } = postValidate(payload);
    if (error) throw createHttpError.BadRequest(error.details[0].message);

    const existingPost = await PostRepository.findPostById(id);
    if (!existingPost) throw createHttpError.NotFound("Post not found");

    if (payload.title) {
      payload.normalized_title = removeDiacritics(payload.title).toLowerCase();
    }

    const updatedPost = await PostRepository.updatePost(
      existingPost?.id,
      payload
    );
    return updatedPost;
  }

  static async deletePost(id) {
    const existingPost = await PostRepository.findPostById(id);
    if (!existingPost) throw createHttpError.NotFound("Post not found");

    await PostRepository.deletePost(id);
  }
}
module.exports = PostService;
