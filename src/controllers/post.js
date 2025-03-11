"use strict";

const { OK, CREATED } = require("../middlewares/success.response");
const PostService = require("../services/post");

class PostController {
  getPosts = async (req, res, next) => {
    return new OK({
      message: "Get posts successfully",
      metadata: await PostService.getPosts(req.query),
    }).send(res);
  };
  getPostById = async (req, res, next) => {
    return new OK({
      message: "Get post by id successfully",
      metadata: await PostService.getPostById(req.params.id),
    }).send(res);
  };

  updatePost = async (req, res, next) => {
    return new OK({
      message: "Update post successfully",
      metadata: await PostService.updatePost(req.params.id, req.body),
    }).send(res);
  };

  deletePost = async (req, res, next) => {
    await PostService.deletePost(req.params.id);
    return new OK({
      message: "Delete post successfully",
    }).send(res);
  };

  createPost = async (req, res, next) => {
    return new CREATED({
      message: "Create post successfully",
      metadata: await PostService.createPost(req.body),
    }).send(res);
  };
}

module.exports = new PostController();
