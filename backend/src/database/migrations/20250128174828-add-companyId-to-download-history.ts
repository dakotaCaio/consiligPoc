import { DataTypes, type QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn('DownloadHistories', 'companyId', {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Companies',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn('DownloadHistories', 'companyId');
  },
}