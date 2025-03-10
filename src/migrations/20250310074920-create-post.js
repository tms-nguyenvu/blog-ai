"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("posts", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
      },
      title: {
        type: Sequelize.STRING,
      },
      content: {
        type: Sequelize.TEXT,
      },
      source_url: {
        type: Sequelize.STRING,
      },
      style: {
        type: Sequelize.STRING,
      },
      crawl_status: {
        type: Sequelize.STRING,
      },
      crawl_time: {
        type: Sequelize.DATE,
      },
      ai_process_time: {
        type: Sequelize.DATE,
      },
      category_id: {
        type: Sequelize.UUID,
        references: {
          model: "categories",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("posts");
  },
};
