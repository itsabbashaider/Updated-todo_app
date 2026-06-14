'use strict';

module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define(
    'Task',
    {
      task_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,  
        allowNull: false,
      },

      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id',
        },
        onDelete: 'CASCADE',
      },

      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 255],
        },
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      priority: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'low',
        validate: {
          isIn: [['high', 'medium', 'low']],
        },
      },

      category: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: [],
      },

      completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      due_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'tasks',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      underscored: true,
    }
  );

  Task.associate = (models) => {
    if (models.User) {
      Task.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE',
      });
    }
  };

  return Task;
};