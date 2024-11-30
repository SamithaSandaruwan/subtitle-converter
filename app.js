const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { Translate } = require('@google-cloud/translate').v2;

const app = express();
const upload = multer({ dest: 'uploads/' });

// Google Translate API setup (replace with your key)
const translator = new Translate({ key: 'YOUR_API_KEY' });

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Upload and convert route
app.post('/convert', upload.single('subtitle'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const targetLanguage = req.body.targetLanguage;

    // Read the .srt file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n');

    // Translate the subtitles
    const translatedLines = await Promise.all(
      lines.map(async (line) => {
        if (/^\d+$/.test(line) || line.includes('-->')) {
          return line; // Skip line numbers and timestamps
        }
        const [translated] = await translator.translate(line, targetLanguage);
        return translated;
      })
    );

    // Create the new subtitle content
    const newSubtitle = translatedLines.join('\n');

    // Send the translated file as a download
    res.setHeader('Content-Disposition', 'attachment; filename=translated.srt');
    res.send(newSubtitle);

    // Cleanup uploaded file
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
