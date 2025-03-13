"use strict";
const createHttpError = require("http-errors");
const removeDiacritics = require("remove-accents");
const PostRepository = require("../repositories/post");
const postValidate = require("../validators/post");
const CategoryRepository = require("../repositories/category");
const { initRedis } = require("../config/redis");

/**
 * Service class for managing posts.
 */
class PostService {
  static redisClient = null;

  static async getRedisClient() {
    if (!this.redisClient) {
      this.redisClient = await initRedis();
    }
    return this.redisClient;
  }

  static async invalidatePostCache(post_id = null) {
    const redisClient = await this.getRedisClient();

    for await (const key of redisClient.scanIterator({
      MATCH: "posts:*",
      COUNT: 1000,
    })) {
      await redisClient.del(key);
    }

    if (post_id) {
      await redisClient.del(`post:${post_id}`);
    }
  }

  /**
   * Creates a new post.
   * @param {Object} payload - The post data.
   * @param {string} payload.title - The title of the post.
   * @param {string} payload.content - The content of the post.
   * @param {string} payload.category_id - The ID of the category.
   * @returns {Promise<Object>} The created post.
   * @throws {createHttpError.BadRequest} If validation fails or category is invalid.
   */
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

    // Invalidate cache after create post
    await this.invalidatePostCache();

    return post;
  }

  /**
   * Retrieves all posts with pagination and filtering options.
   * @param {Object} query - The query parameters.
   * @param {number} [query.page=1] - The page number.
   * @param {number} [query.limit=10] - The number of items per page.
   * @param {string} [query.orderby="normalized_title"] - The field to order by.
   * @param {string} [query.sortby="asc"] - The sort order (asc or desc).
   * @param {string} [query.keyword] - The keyword to filter by.
   * @returns {Promise<Object>} The paginated posts.
   */
  static async getPosts(query) {
    const {
      page = 1,
      limit = 10,
      orderby = "normalized_title",
      sortby = "asc",
      keyword,
    } = query;

    const redisClient = await this.getRedisClient();
    const cacheKey = `posts:${page}-${limit}-${orderby}-${sortby}-${keyword}`;
    const cachedPosts = await redisClient.get(cacheKey);

    if (cachedPosts) {
      return JSON.parse(cachedPosts);
    }

    const posts = await PostRepository.findAllPost({
      page: isNaN(parseInt(page)) || page <= 0 ? 1 : parseInt(page),
      limit: isNaN(parseInt(limit)) || limit <= 0 ? 10 : parseInt(limit),
      orderby: orderby,
      sortby: sortby,
      keyword: keyword,
    });

    await redisClient.set(cacheKey, JSON.stringify(posts), {
      EX: 60,
    });
    return posts;
  }

  /**
   * Retrieves a post by its ID.
   * @param {string} id - The ID of the post.
   * @returns {Promise<Object>} The post.
   * @throws {createHttpError.NotFound} If the post is not found.
   */
  static async getPostById(id) {
    const redisClient = await this.getRedisClient();
    const cacheKey = `post:${id}`;
    const cachedPost = await redisClient.get(cacheKey);

    if (cachedPost) return JSON.parse(cachedPost);

    const post = await PostRepository.findPostById(id);
    if (!post) throw createHttpError.NotFound("Post not found");

    await redisClient.set(cacheKey, JSON.stringify(post), {
      EX: 300,
    });
    return post;
  }

  /**
   * Updates a post by its ID.
   * @param {string} id - The ID of the post.
   * @param {Object} payload - The updated post data.
   * @returns {Promise<Object>} The updated post.
   * @throws {createHttpError.BadRequest} If validation fails.
   * @throws {createHttpError.NotFound} If the post is not found.
   */
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

    // Invalidate cache after update post
    await this.invalidatePostCache(id);
    return updatedPost;
  }

  /**
   * Deletes a post by its ID.
   * @param {string} id - The ID of the post.
   * @returns {Promise<void>}
   * @throws {createHttpError.NotFound} If the post is not found.
   */
  static async deletePost(id) {
    const existingPost = await PostRepository.findPostById(id);
    if (!existingPost) throw createHttpError.NotFound("Post not found");

    // Invalidate cache after delete post

    await PostRepository.deletePost(id);
    await this.invalidatePostCache(id);
  }
}

module.exports = PostService;
