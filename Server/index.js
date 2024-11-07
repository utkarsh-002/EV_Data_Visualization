const express = require('express');
const app = express();
const db = require('./models');
const cors = require("cors");

app.use(
  cors({
    origin: "*",
  })
);

const salesQuery = require('./routes/statewiseQueries');
const evTimeSeries = require('./routes/EVTimeSeries');
const procedure = require('./routes/createStatewiseProcedure');

app.use("/statewiseSales", procedure);
app.use("/swQuery", salesQuery);
app.use("/evTimeSeries", evTimeSeries);

db.sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
}).catch((err) => {
  console.log(err);
});