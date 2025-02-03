'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Templates', 'lastTemplate', {
            type: Sequelize.TEXT,
            allowNull: false,
            defaultValue: "",
            unique: false,
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Templates', 'lastTemplate');
    }
};
