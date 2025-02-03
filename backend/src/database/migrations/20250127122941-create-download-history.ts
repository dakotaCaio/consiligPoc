module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('DownloadHistories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      templateId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Templates',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      companyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      downloadedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('DownloadHistories');
  }
};
