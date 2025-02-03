'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Tickets', 'cpnTickets', {
      type: Sequelize.BOOLEAN,
      defaultValue: false, 
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Tickets', 'cpnTickets');
  }
};
