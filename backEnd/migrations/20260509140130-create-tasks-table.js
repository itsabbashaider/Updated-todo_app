'use strict';

module.exports = {

  // ─── Up ───────────────────────────────────────────────────────────────────────
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable(

      'Tasks',

      {

        // ─── Primary Key ────────────────────────────────────────────────────────

        task_id: {

          type:
            Sequelize.INTEGER,

          primaryKey:
            true,

          autoIncrement:
            true,

          allowNull:
            false,

        },

        // ─── Fields ─────────────────────────────────────────────────────────────

        title: {

          type:
            Sequelize.STRING,

          allowNull:
            false,

        },

        description: {

          type:
            Sequelize.TEXT,

          allowNull:
            true,

        },

        completed: {

          type:
            Sequelize.BOOLEAN,

          defaultValue:
            false,

        },

        priority: {

          type:
            Sequelize.STRING,

          allowNull:
            false,

          defaultValue:
            'low',

        },

        completed_at: {

          type:
            Sequelize.DATE,

          allowNull:
            true,

        },

        // ─── TIMESTAMPS ────────────────────────────────────────────────────────

        created_at: {

          type:
            Sequelize.DATE,

          allowNull:
            false,

        },

        updated_at: {

          type:
            Sequelize.DATE,

          allowNull:
            false,

        },

      }

    );

  },

  // ─── Down ────────────────────────────────────────────────────────────────────

  async down(queryInterface) {

    await queryInterface.dropTable(
      'Tasks'
    );

  },

};