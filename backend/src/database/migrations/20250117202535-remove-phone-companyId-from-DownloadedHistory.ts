'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('DownloadHistories', 'companyId');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('DownloadHistories', 'companyId', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
};
