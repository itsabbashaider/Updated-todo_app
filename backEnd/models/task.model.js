"use strict";

module.exports = (sequelize, DataTypes) => {

  const Task = sequelize.define(

    "Task",

    {

      task_id: {

        type:
          DataTypes.INTEGER,

        primaryKey:
          true,

        autoIncrement:
          true,

      },

      title: {

        type:
          DataTypes.STRING,

        allowNull:
          false,

      },

      description: {

        type:
          DataTypes.TEXT,

        allowNull:
          true,

      },

      completed: {

        type:
          DataTypes.BOOLEAN,

        defaultValue:
          false,

      },

      priority: {

        type:
          DataTypes.STRING,

        allowNull:
          false,

        defaultValue:
          "low",

      },

      completed_at: {

        type:
          DataTypes.DATE,

        allowNull:
          true,

      },

    },

    {

      tableName:
        "Tasks",

      timestamps:
        true,

      createdAt:
        "created_at",

      updatedAt:
        "updated_at",

    }

  );

  return Task;

};