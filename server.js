const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const DATA_FILE = path.join(__dirname, 'all_racers.json');

app.get('/api/races', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Failed to load data');
        res.json(JSON.parse(data));
    });
});

app.post('/api/save', (req, res) => {
    fs.writeFile(DATA_FILE, JSON.stringify(req.body, null, 2), err => {
        if (err) return res.status(500).send('Failed to save');
        res.send('Saved successfully');
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
