import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn('DownloadHistories', 'templateId');
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn('DownloadHistories', 'templateId', {
      type: DataTypes.INTEGER,
      allowNull: false, 
    });
  },
};
