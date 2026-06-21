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
      first_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      security_question_1: DataTypes.STRING,
      security_answer_1: DataTypes.STRING,      // hashed
      security_question_2: DataTypes.STRING,
      security_answer_2: DataTypes.STRING,      // hashed
      password_reset_token: DataTypes.STRING,   // unique
      password_reset_expires_at: DataTypes.DATE,
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
