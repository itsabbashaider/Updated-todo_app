'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Ensure uuid-ossp extension exists
    await queryInterface.sequelize.query(
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
    );

    await queryInterface.createTable('tasks', {
      task_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
      },

      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id',
        },
        onDelete: 'CASCADE',
      },

      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      priority: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'low',
      },

      category: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: [],
      },

      completed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },

      completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      due_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('tasks', ['user_id']);
    await queryInterface.addIndex('tasks', ['completed']);
    await queryInterface.addIndex('tasks', ['created_at']);
    await queryInterface.addIndex('tasks', ['completed_at']);
    await queryInterface.addIndex('tasks', ['user_id', 'completed']);
    await queryInterface.addIndex('tasks', ['user_id', 'created_at']);
    await queryInterface.addIndex('tasks', ['user_id', 'completed_at']);
    await queryInterface.addIndex('tasks', ['user_id', 'priority']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tasks');
  },
};