import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface) => {
  await queryInterface.addColumn('Tickets', 'responseCount', {
    type: DataTypes.STRING,
    allowNull: true, 
  });
};

export const down = async (queryInterface: QueryInterface) => {
  await queryInterface.removeColumn('Tickets', 'responseCount');
};
