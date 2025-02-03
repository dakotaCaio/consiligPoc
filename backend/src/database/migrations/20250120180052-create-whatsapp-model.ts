'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Adicionando a coluna 'number' à tabela 'Whatsapps'
    await queryInterface.addColumn('Whatsapps', 'number', {
      type: Sequelize.STRING,
      allowNull: true,  // Ou false se for obrigatório
      unique: true,     // Se deseja que o número seja único na tabela
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Removendo a coluna 'number' caso a migration seja revertida
    await queryInterface.removeColumn('Whatsapps', 'number');
  },
};
