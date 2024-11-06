const express = require('express');
const mysql = require('mysql2');
const createProcedureRouter = require('./createProcedure');
const app = express();
const port = 3000;

app.use(express.json());
app.use('/create-procedure', createProcedureRouter);

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'yourUsername',
  password: 'yourPassword',
  database: 'yourDatabase'
});

// Connect to the database
connection.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database.');
});

// Define a route to call the stored procedure
app.get('/ev-data/:state', (req, res) => {
  const stateName = req.params.state;

  // Call the stored procedure
  connection.query('CALL GetEvDataByState(?)', [stateName], (err, results) => {
    if (err) {
      console.error('Error calling stored procedure:', err);
      res.status(500).send('Error calling stored procedure');
      return;
    }
    res.json(results[0]);
  });
});

app.post('/create-ev-statewise', (req, res) => {
  const { year, month, vehicleCategory, vehicleType } = req.body;

  // Call the stored procedure
  connection.query('CALL CreateEvStatewiseTable(?, ?, ?, ?)', [year, month, vehicleCategory, vehicleType], (err, results) => {
    if (err) {
      console.error('Error calling stored procedure:', err);
      res.status(500).send('Error calling stored procedure');
      return;
    }
    res.send('Table created successfully.');
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
