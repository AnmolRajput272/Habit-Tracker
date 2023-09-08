const Habit = require("../models/ habit");
const HabitStatus = require("../models/habitstatus");

async function insertHabitStatusTillPresentDate() {
  try {

    const habits = await Habit.findAll({});

    for(const habit of habits){
      const habitId = habit["id"];
      // Find the last recorded date for the habit
      const lastStatus = await HabitStatus.findOne({
        where: {
          habit_id: habitId,
        },
        order: [['date', 'DESC']],
      });

      // Get today's date
      const currentDate = new Date();

      // Calculate the dates between the last recorded date and today
      const dateRange = [];
      let currentDateInLoop = lastStatus ? new Date(lastStatus.date) : new Date();
      currentDateInLoop.setDate(currentDateInLoop.getDate() + 1); // Start from the next day

      while (currentDateInLoop <= currentDate) {
        dateRange.push(new Date(currentDateInLoop));
        currentDateInLoop.setDate(currentDateInLoop.getDate() + 1);
      }

      // Insert a new status with 'None' for each date in the range
      for (const date of dateRange) {
        await HabitStatus.create({
          habit_id: habitId,
          date: date,
          status: 'None',
        });
      }
    }

    console.log(`Inserted ${dateRange.length} 'None' statuses for Habit ID ${habitId}.`);
  } catch (error) {
    console.error(error);
  }
}

async function getAllHabits(){
    await insertHabitStatusTillPresentDate();
    const habits = await Habit.findAll({
      include: [
        {
          model: HabitStatus,
          order: [['date', 'DESC']],
          limit: 7,
        },
      ],
      order: [['id', 'ASC']]
    });
  
    const habitsWithStats = [];
    for (const habit of habits) {
      const stats = await getHabitStats(habit.id);
      const habitJson = habit.toJSON();
      habitJson["HabitStatuses"] = habitJson["HabitStatuses"].reverse();
      habitsWithStats.push({ ...habitJson, stats });
    }
  
    return habitsWithStats;
}

// Function for getting habit statistics
async function getHabitStats(habitId) {
    const habit = await Habit.findByPk(habitId, {
      include: [
        {
          model: HabitStatus,
          order: [['date', 'ASC']]
        },
      ],
    });
  
    const statuses = habit.HabitStatuses.map(status => status.status);
  
    let bestStreak = 0;
    let presentStreak = 0;
    let totalDoneDays = 0;
  
    for (const status of statuses) {
      if (status === 'Done') {
        presentStreak++;
        totalDoneDays++;
        if (presentStreak > bestStreak) {
          bestStreak = presentStreak;
        }
      } else {
        presentStreak = 0;
      }
    }
  
    return {
      bestStreak,
      presentStreak,
      totalDoneDays,
    };
}

const HabitController = {
  getAllHabits:async (req, res) => {
    try {
      const habitsWithStats = await getAllHabits();
      res.status(200).send(habitsWithStats);
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred');
    }
  },
  deleteHabit:async (req, res) => {
    const habitId = req.params.habitId;
  
    try {
      const habit = await Habit.findByPk(habitId);
      if (habit) {
        await habit.destroy();
        res.sendStatus(200);
      } else {
        res.status(404).send('Habit not found');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred');
    }
  },
  toggleFavourite:async (req, res) => {
    const habitId = req.params.habitId;
    const { isFavorite } = req.body;
  
    try {
      const habit = await Habit.findByPk(habitId);
      if (habit) {
        await habit.update({ isFavorite });
        res.sendStatus(200);
      } else {
        res.status(404).send('Habit not found');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred');
    }
  },
  createHabit:async (req, res) => {
    const { name, time } = req.body;
    try {
      const newHabit = await Habit.create({
        name,
        time,
      });
  
      const currentDate = new Date();
      for (let i = 0; i < 7; i++) {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() - i);
        await HabitStatus.create({
          habit_id: newHabit.id,
          date: date.toISOString().split('T')[0],
          status: 'None',
        });
      }
      const habitsWithStats = await getAllHabits();
      res.render('index',{ habits: habitsWithStats });
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred');
    }
  },
  renderHomepage:async (req, res) => {
    try {
      const habitsWithStats = await getAllHabits();
      res.render('index', { habits: habitsWithStats });
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred');
    }
  },
  changeStatusOfHabitForDate:async (req, res) => {
    const habitId = req.params.habitId;
    const date = req.params.date;
    const newStatus = req.body.newStatus;
    try {
      const habitStatus = await HabitStatus.findOne({
        where: { habit_id: habitId, date },
      });
  
      if (habitStatus) {
        await habitStatus.update({ status: newStatus });
        res.sendStatus(200);
      } else {
        res.status(404).send('Habit Status not found');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred');
    }
  }
}

module.exports = HabitController;