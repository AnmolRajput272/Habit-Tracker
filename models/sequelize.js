const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('habit_tracker', 'superanmol1', '123', {
    host: 'localhost',
    port: '5432',
    dialect: 'postgres'
});

module.exports = {
    sequelize,
    DataTypes
}