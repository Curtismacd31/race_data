const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const multer = require('multer');
const xml2js = require('xml2js');
const upload = multer({ dest: 'uploads/' });

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


app.post('/api/uploadXml', upload.single('file'), async (req, res) => {
  const xmlPath = req.file.path;

  try {
    const xmlData = fs.readFileSync(xmlPath, 'utf8');
    const result = await xml2js.parseStringPromise(xmlData, { mergeAttrs: true });

    const races = [];
    const raceNodes = result.TVGraphics.Race || [];

    raceNodes.forEach((raceNode, raceIndex) => {
      const raceNumber = raceNode.race_number?.[0] || `${raceIndex + 1}`;
      const racers = [];

      const starterNodes = raceNode.Starters?.[0]?.Starter || [];
      starterNodes.forEach((starterNode) => {
        racers.push({
          id: starterNode.horse_number?.[0] || "",
          horseName: starterNode.horse_name?.[0] || "",
          driverName: starterNode.driver_name?.[0] || "",
          trainerName: starterNode.trainer_name?.[0] || "",
          ownerName: starterNode.owner_name?.[0] || "",
          sire: starterNode.horse_sire_name?.[0] || "",
          dam: starterNode.horse_dam_name?.[0] || ""
        });
      });

      races.push({
        raceNumber,
        racers
      });
    });

    // Clean up temp file
    fs.unlinkSync(xmlPath);

    // Return JSON version
    res.json({ race: races });

  } catch (err) {
    console.error("XML parse error:", err);
    res.status(500).send('Failed to parse XML');
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
