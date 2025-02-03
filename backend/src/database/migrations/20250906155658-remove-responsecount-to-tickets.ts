import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn('Tickets', 'responseCount');
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn('Tickets', 'responseCount', {
      type: DataTypes.INTEGER,
      allowNull: false, 
    });
  },
};
