import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface) => {
  await queryInterface.addColumn('Tickets', 'lastMessageUpdatedAt', {
    type: DataTypes.DATE,
    allowNull: true, 
  });
};

export const down = async (queryInterface: QueryInterface) => {
  await queryInterface.removeColumn('Tickets', 'lastMessageUpdatedAt');
};
