const express = require('express');
const router = express.Router();
const HabitController = require("../controllers/habitController");

// Getting all habits along with statuses
router.get('', HabitController.getAllHabits);

// Delete habit API
router.delete('/:habitId', HabitController.deleteHabit);

// Toggle Favourite status API
router.put('/:habitId/favourite', HabitController.toggleFavourite);

router.get('/Home', HabitController.renderHomepage);

// Creating a habit with default statuses for the last 7 days
router.post('/create', HabitController.createHabit);

router.post('/:habitId/status/:date', HabitController.changeStatusOfHabitForDate);

module.exports = router;