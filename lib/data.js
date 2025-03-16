import fs from 'fs';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'entries.json');
const INITIAL_TOTAL = 50000;

export function getData() {
  try {
    if (!fs.existsSync(DATA_FILE_PATH)) {
      return { entries: [] };
    }
    const data = JSON.parse(fs.readFileSync(DATA_FILE_PATH, 'utf8'));
    return data;
  } catch (error) {
    console.error('Error reading data:', error);
    return { entries: [] };
  }
}

export function calculateTotal(data) {
  const sumOfEntries = data.entries.reduce((sum, entry) => sum + entry.number, 0);
  return INITIAL_TOTAL - sumOfEntries;
}