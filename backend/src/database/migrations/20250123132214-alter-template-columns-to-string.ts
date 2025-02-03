"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("Templates", "mainTemplate", {
      type: Sequelize.STRING(1000), // Define o tamanho que você achar necessário, por exemplo, 1000 caracteres
      allowNull: false,
    });

    await queryInterface.changeColumn("Templates", "retryTemplate", {
      type: Sequelize.STRING(1000), // Define o tamanho que você achar necessário
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Caso precise reverter a migração, você pode voltar para o tipo TEXT
    await queryInterface.changeColumn("Templates", "mainTemplate", {
      type: Sequelize.TEXT,
      allowNull: false,
    });

    await queryInterface.changeColumn("Templates", "retryTemplate", {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },
};
