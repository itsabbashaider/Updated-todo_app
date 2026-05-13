'use strict';

module.exports = (sequelize, DataTypes) => {

  // ─── Model Definition ─────────────────────────────────────────────────────────
  const Task = sequelize.define('Task', {

    // ─── Primary Key ────────────────────────────────────────────────────────────
    task_id: {
      type         : DataTypes.INTEGER,
      primaryKey   : true,
      autoIncrement: true,
    },

    // ─── Fields ─────────────────────────────────────────────────────────────────
    title: {
      type     : DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type     : DataTypes.TEXT,
      allowNull: true,
    },

    completed: {
      type        : DataTypes.BOOLEAN,
      defaultValue: false,
    },

    completed_at: {
      type     : DataTypes.DATE,
      allowNull: true,
    },

  }, {
    tableName : 'Tasks',
    timestamps: true,
  });

  return Task;

};