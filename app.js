// app.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sequelize } = require("./models/sequelize");
const habitRoutes = require("./routes/habitRoutes");
const path = require('path');

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Sync models with the database
(async () => {
  await sequelize.sync(); // Creates tables if they don't exist
})();

app.use('/habits',habitRoutes);

app.get('/',async (req, res) => {
  res.redirect('/habits/Home');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

