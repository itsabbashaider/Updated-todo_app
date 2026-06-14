module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      user_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      securityQuestion1: DataTypes.STRING,
      securityAnswer1: DataTypes.STRING,      // hashed
      securityQuestion2: DataTypes.STRING,
      securityAnswer2: DataTypes.STRING,      // hashed
      passwordResetToken: DataTypes.STRING,   // unique
      passwordResetExpiresAt: DataTypes.DATE,
    },
    {
      tableName: 'users',
      timestamps: true,
    }
  );

  User.associate = (models) => {
    User.hasMany(models.Task, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE',
    });
  };

  return User;
};
