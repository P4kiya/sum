import fs from 'fs';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'entries.json');

// Ensure the data directory exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'));
}

// Initialize the file with empty array if it doesn't exist or is empty
if (!fs.existsSync(DATA_FILE_PATH) || fs.readFileSync(DATA_FILE_PATH, 'utf8').trim() === '') {
  fs.writeFileSync(DATA_FILE_PATH, JSON.stringify([], null, 2));
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { number, comment } = req.body;
    
    // Read existing entries
    let entries = [];
    try {
      entries = JSON.parse(fs.readFileSync(DATA_FILE_PATH, 'utf8'));
    } catch (error) {
      // If there's an error parsing, initialize with empty array
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify([], null, 2));
    }
    
    // Create new entry with current date
    const newEntry = {
      number: Number(number),
      comment,
      date: new Date().toISOString(),
      id: Date.now() // unique identifier
    };
    
    // Add new entry
    entries.push(newEntry);
    
    // Calculate new total
    const total = 50000 - entries.reduce((sum, entry) => sum + entry.number, 0);
    
    // Save updated entries
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(entries, null, 2));
    
    res.status(200).json({ total, message: 'Entry saved successfully' });
  } catch (error) {
    console.error('Error saving entry:', error);
    res.status(500).json({ message: 'Error saving entry' });
  }
}