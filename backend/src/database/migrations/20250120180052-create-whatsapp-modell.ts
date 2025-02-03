'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Alterando a coluna 'number' para 'allowNull: false' e 'unique: true'
    await queryInterface.changeColumn('Whatsapps', 'number', {
      type: Sequelize.STRING,
      allowNull: false,  // Torna o número obrigatório
      unique: true,      // Garante que o número seja único
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Caso a migração seja revertida, você pode voltar para a versão anterior
    await queryInterface.changeColumn('Whatsapps', 'number', {
      type: Sequelize.STRING,
      allowNull: true,  // Permite nulos novamente
      unique: false,    // Remove a restrição de unicidade
    });
  },
};
