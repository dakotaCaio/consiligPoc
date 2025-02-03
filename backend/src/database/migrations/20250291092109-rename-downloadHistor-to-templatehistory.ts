import { QueryInterface, Sequelize } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface, sequelize: Sequelize) => {
    await queryInterface.renameTable('TemplateHistory', 'TemplateHistories');
  },

  down: async (queryInterface: QueryInterface, sequelize: Sequelize) => {
    await queryInterface.renameTable('TemplateHistories', 'TemplateHistory');
  }
};
