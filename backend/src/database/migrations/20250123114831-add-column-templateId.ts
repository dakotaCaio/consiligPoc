'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    
    await queryInterface.addColumn('Tickets', 'templateId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,  
        unique: false,      // Garante que o número seja único
      });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Tickets', 'templateId');
  }
};