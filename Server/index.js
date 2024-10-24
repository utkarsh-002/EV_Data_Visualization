const express = require('express');
const app = express();
const db = require('./models');

const salesQuery = require('./routes/statewiseQueries');
app.use("/swQuery", salesQuery);

db.sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
}).catch((err) => {
  console.log(err);
});