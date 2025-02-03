'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Tickets', 'mainTemplate', {
      type: Sequelize.BOOLEAN,
      allowNull: false,       
      defaultValue: false,     
      unique: false,          
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Tickets', 'mainTemplate');
  }
};