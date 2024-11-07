const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
    origin: 'http://localhost:3001' // Allow requests from this origin
}));

app.post('/createProcedure', (req, res) => {
    // Your existing code for handling the request
    res.send('Procedure created');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
