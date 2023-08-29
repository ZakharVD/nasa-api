const express = require('express');
const cors = require('cors');
const path = require('path');
const api = require('./routes/api')

// initialize express
const app = express();

app.use(cors({
    origin: 'http://localhost:3000'
}));
app.use(express.json());

// hosting FE code
app.use(express.static(path.join(__dirname, '..', 'public')))

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'))
})

app.use('/v1', api)

module.exports = app;