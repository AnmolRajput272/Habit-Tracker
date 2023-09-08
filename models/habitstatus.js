const { sequelize, DataTypes } = require("./sequelize");

const HabitStatus = sequelize.define('HabitStatus', {
    habit_id: {
      type: DataTypes.INTEGER, // Use INTEGER instead of Integer
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('None', 'Done', 'Not done'),
      allowNull: false,
    },
});

module.exports = HabitStatus;