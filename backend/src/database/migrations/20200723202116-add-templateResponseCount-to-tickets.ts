import { DataTypes, type QueryInterface } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn('Tickets', 'templateResponseCount', {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: true,
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn('Tickets', 'templateResponseCount');
  }
}