"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models) {
      Post.belongsTo(models.Category, {
        foreignKey: "category_id",
        as: "category",
      });
    }
  }
  Post.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: DataTypes.STRING,
      normalized_title: DataTypes.STRING,
      content: DataTypes.TEXT,
      source_url: DataTypes.STRING,
      style: DataTypes.STRING,
      crawl_status: DataTypes.STRING,
      crawl_time: DataTypes.DATE,
      ai_process_time: DataTypes.DATE,
      category_id: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: "Post",
      tableName: "posts",
      underscored: true,
    }
  );
  return Post;
};
