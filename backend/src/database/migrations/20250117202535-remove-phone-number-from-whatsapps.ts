'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove a coluna 'phoneNumber' da tabela 'Whatsapps'
    await queryInterface.removeColumn('Whatsapps', 'phoneNumber');
  },

  down: async (queryInterface, Sequelize) => {
    // Caso queira reverter, você pode adicionar a coluna de volta
    await queryInterface.addColumn('Whatsapps', 'phoneNumber', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
};
