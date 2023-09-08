document.addEventListener('DOMContentLoaded', function () {

  let interval = 'weekly';
  const habitsDiv = document.getElementById('habits-container');
  habitsDiv.addEventListener('click', async (event) => {
    if (event.target.classList.contains('add-to-favorite')) {
      const habitId = event.target.getAttribute('data-habit-id');
      await addToFavorite(habitId);
    } else if (event.target.classList.contains('delete-habit')) {
      const habitId = event.target.getAttribute('data-habit-id');
      await deleteHabit(habitId);
    }
  });

    // Function to toggle habit status
  function toggleStatus(button) {
    const statuses = ['None', 'Done', 'Not done'];
    let currentStatus = button.textContent;
    currentStatus = currentStatus.trim()
    console.log(currentStatus,currentStatus.length);
    const newStatus = statuses[(statuses.indexOf(currentStatus) + 1) % 3];
    button.textContent = newStatus;
    return newStatus;
  }

  async function changeStatusOnServer(habitId, date, newStatus) {
    try {
      const response = await fetch(`/habits/${habitId}/status/${date}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newStatus }),
      });

      if (response.ok) {
        await fetchAndDisplayStats('weekly');
      } else {
        console.error('Error changing status on the server');
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Function to toggle favourite status
  async function toggleFavourite(habitId, isFavorite) {
    try {
      const response = await fetch(`/habits/${habitId}/favourite`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isFavorite: !isFavorite }),
      });

      if (response.ok) {
        await fetchAndDisplayStats('weekly');
      } else {
        console.error('Error toggling favourite status');
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Function to delete habit
  async function deleteHabit(habitId) {
    try {
      const response = await fetch(`/habits/${habitId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchAndDisplayStats('weekly');
      } else {
        console.error('Error deleting habit');
      }
    } catch (error) {
      console.error(error);
    }
  }

  habitsDiv.addEventListener('click', async (event) => {

    // Toggle Favourite button
    if (event.target.classList.contains('toggle-favourite')) {
      const button = event.target;
      const habitId = button.getAttribute('data-habit-id');
      const isFavorite = button.textContent.includes('Remove');
      await toggleFavourite(habitId, isFavorite);
    }

    // Delete button
    if (event.target.classList.contains('delete-habit')) {
      const button = event.target;
      const habitId = button.getAttribute('data-habit-id');
      await deleteHabit(habitId);
    }
    
    // Change Status button
    if (event.target.classList.contains('change-status')) {
      const button = event.target;
      const newStatus = toggleStatus(button);
      const habitId = button.getAttribute('data-habit-id');
      const date = button.getAttribute('data-date');

      await changeStatusOnServer(habitId, date, newStatus);
    }
  });

    const showDailyButton = document.getElementById('show-daily');
    const showWeeklyButton = document.getElementById('show-weekly');

    showDailyButton.addEventListener('click', async function () {
      interval = 'daily';
      await fetchAndDisplayStats();
    });

    showWeeklyButton.addEventListener('click', async function () {
      interval = 'weekly';
      await fetchAndDisplayStats();
    });

    async function fetchAndDisplayStats() {
      const habitsDiv = document.getElementById('habits-container');
      const response = await fetch('/habits');
      const habitsWithStats = await response.json();

      habitsDiv.innerHTML = habitsWithStats.map(habit => `
        <li>
          <div class="habit">
            <h2 class="habit-name">Habit Name: ${habit.name}</h3>
            <p class="habit-time">Time: ${habit.time}</p>
            <div class="status-list">
              ${habit.HabitStatuses.splice(interval==='weekly' ? 0 : 6).map(status => `
                <div class="status">
                  <div class="status-date">
                    ${`Date: ${status.date}`}
                  </div>
                  <button class="change-status" data-habit-id="${habit.id}" data-date="${status.date}">
                    ${status.status}
                  </button>
                </div>
              `).join('')}
            </div>

            <div class="btn-stats">
              <div class="stats">
                <p>Best Streak: ${habit.stats.bestStreak}</p>
                <p>Present Streak: ${habit.stats.presentStreak}</p>
                <p>Total Done Days: ${habit.stats.totalDoneDays}</p>
              </div>
              <div>
                <button class="toggle-favourite" data-habit-id="${habit.id}">
                  ${habit.isFavorite ? 'Remove from Favourites' : 'Add to Favourites'}
                </button>
                <button class="delete-habit" data-habit-id="${habit.id}">Delete</button>
              </div>
            </div>

          </div>
        </li>
      `).join('');
    }

  });