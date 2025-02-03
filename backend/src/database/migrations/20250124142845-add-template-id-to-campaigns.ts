'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Campaigns', 'templateId', {
      type: Sequelize.INTEGER,
      allowNull: true, 
      references: {
        model: 'Templates', 
        key: 'id',        
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Campaigns', 'templateId');
  }
};
