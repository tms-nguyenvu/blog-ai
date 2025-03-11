"use strict";

const express = require("express");
const router = express.Router();
const asyncHandler = require("../middlewares/async.handler");
const postController = require("../controllers/post");

router.get("/", asyncHandler(postController.getPosts));
router.get("/:id", asyncHandler(postController.getPostById));
router.post("/", asyncHandler(postController.createPost));
router.put("/:id", asyncHandler(postController.updatePost));
router.delete("/:id", asyncHandler(postController.deletePost));

module.exports = router;
