const { sequelize, DataTypes } = require("./sequelize");
const HabitStatus = require("./habitstatus");

const Habit = sequelize.define('Habit', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    isFavorite: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
});

Habit.hasMany(HabitStatus, { foreignKey: 'habit_id' });
HabitStatus.belongsTo(Habit, { foreignKey: 'habit_id' });

module.exports = Habit;