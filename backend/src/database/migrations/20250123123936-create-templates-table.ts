"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Templates", "companyId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Companies", 
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Templates", "companyId");
  },
};