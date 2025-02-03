'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Contacts', 'templateUpdate', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
      unique: false,
  });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Contacts', 'templateUpdate');
  }
};