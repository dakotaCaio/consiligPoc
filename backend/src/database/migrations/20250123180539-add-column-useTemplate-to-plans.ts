'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Plans', 'useTemplate', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: null,
      unique: false,
  });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Plans', 'useTemplate');
  }
};