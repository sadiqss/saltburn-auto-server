const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
    res.send('Hello from Saltburn Auto Solution!')
})

app.listen(port, () => {
    console.log(`Saltburn auto solution app listening on port ${port}`)
})