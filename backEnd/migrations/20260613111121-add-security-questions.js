'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'securityQuestion1', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Security question 1 ID/key',
    });

    await queryInterface.addColumn('users', 'securityAnswer1', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Hashed answer to security question 1',
    });

    await queryInterface.addColumn('users', 'securityQuestion2', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Security question 2 ID/key',
    });

    await queryInterface.addColumn('users', 'securityAnswer2', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Hashed answer to security question 2',
    });

    await queryInterface.addColumn('users', 'passwordResetToken', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
      comment: 'Token for password reset (valid 15 min)',
    });

    await queryInterface.addColumn('users', 'passwordResetExpiresAt', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Expiry time for password reset token',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'securityQuestion1');
    await queryInterface.removeColumn('users', 'securityAnswer1');
    await queryInterface.removeColumn('users', 'securityQuestion2');
    await queryInterface.removeColumn('users', 'securityAnswer2');
    await queryInterface.removeColumn('users', 'passwordResetToken');
    await queryInterface.removeColumn('users', 'passwordResetExpiresAt');
  }
};