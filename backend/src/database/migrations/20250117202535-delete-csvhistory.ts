import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable('CsvHistories');
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable('CsvHistories', {
    });
  },
};
