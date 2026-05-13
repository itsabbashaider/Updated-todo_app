'use strict';

// ─── Core Dependencies ────────────────────────────────────────────────────────
const path   = require('path');
const fs     = require('fs');
const process = require('process');

// ─── Environment Setup ────────────────────────────────────────────────────────
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// ─── Database Dependencies ────────────────────────────────────────────────────
const Sequelize = require('sequelize');

// ─── Config ───────────────────────────────────────────────────────────────────
const env    = process.env.NODE_ENV || 'development';
const config = require('../config/config.js')[env];

// ─── Sequelize Instance ───────────────────────────────────────────────────────
const sequelize = config.use_env_variable
  ? new Sequelize(process.env[config.use_env_variable], config)
  : new Sequelize(config.database, config.username, config.password, config);

// ─── Load Models ──────────────────────────────────────────────────────────────
const basename = path.basename(__filename);
const db       = {};

fs.readdirSync(__dirname)
  .filter((file) =>
    file.indexOf('.')      !== 0  &&
    file                  !== basename &&
    file.slice(-3)        === '.js' &&
    file.indexOf('.test.js') === -1
  )
  .forEach((file) => {
    const model    = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// ─── Run Associations ─────────────────────────────────────────────────────────
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) db[modelName].associate(db);
});

// ─── Attach Sequelize to db ───────────────────────────────────────────────────
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// ─── Sync Database ────────────────────────────────────────────────────────────
sequelize
  .sync({ alter: true })
  .then(()      => console.log('Database Connected'))
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  });

module.exports = db;