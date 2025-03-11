"use strict";

const express = require("express");
const router = express.Router();

// Import all routers
const categoryRouter = require("./category");

// Use all routers
router.use("/v1/api/categories", categoryRouter);

module.exports = router;
