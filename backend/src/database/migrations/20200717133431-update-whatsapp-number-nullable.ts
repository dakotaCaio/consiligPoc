import { DataTypes, type QueryInterface } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.changeColumn('Whatsapps', 'number', {
      type: DataTypes.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.changeColumn('Whatsapps', 'number', {
      type: DataTypes.STRING,
      allowNull: false,
    })
  }
}