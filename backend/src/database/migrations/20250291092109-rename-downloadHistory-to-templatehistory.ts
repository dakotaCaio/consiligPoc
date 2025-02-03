import { QueryInterface, Sequelize } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface, sequelize: Sequelize) => {
    await queryInterface.renameTable('DownloadHistories', 'TemplateHistory');
  },

  down: async (queryInterface: QueryInterface, sequelize: Sequelize) => {
    await queryInterface.renameTable('TemplateHistory', 'DownloadHistories');
  }
};
