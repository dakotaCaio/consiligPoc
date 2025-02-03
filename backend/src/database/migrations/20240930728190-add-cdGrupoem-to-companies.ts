'use strict';
import { QueryInterface, DataTypes } from 'sequelize';

export default {
    up: async (queryInterface: QueryInterface): Promise<void> => {
        await queryInterface.addColumn('Companies', 'cdGrupoem', {
            type: DataTypes.STRING,
            allowNull: true, // Altere para false se você quiser que a coluna não aceite valores nulos
        });
    },
    down: async (queryInterface: QueryInterface): Promise<void> => {
        await queryInterface.removeColumn('Companies', 'cdGrupoem');
    }
};
