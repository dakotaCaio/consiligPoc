import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn('Tickets', 'lastMessageUpdatedAt');
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn('Tickets', 'lastMessageUpdatedAt', {
      type: DataTypes.INTEGER,
      allowNull: false, 
    });
  },
};
