"use strict";

const express = require("express");
const router = express.Router();

// Import all routers
const categoryRouter = require("./category");
const postRouter = require("./post");

// Use all routers
router.use("/v1/api/categories", categoryRouter);
router.use("/v1/api/posts", postRouter);

module.exports = router;
