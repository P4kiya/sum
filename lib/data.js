import connectToDatabase from './mongodb';
import { AUTOCOMPLETE_KEYWORDS } from './constants';

const INITIAL_TOTAL = 6100;

export async function getData() {
  try {
    const { db } = await connectToDatabase();
    const entries = await db.collection('entries')
      .find({})
      .sort({ date: -1 })  // Sort by date descending at DB level
      .toArray();

    const serializedEntries = entries.map(entry => ({
      ...entry,
      _id: entry._id.toString(),
      id: entry._id.toString(),
    }));
    
    return { entries: serializedEntries };
  } catch (error) {
    console.error('Error reading data:', error);
    return { entries: [] };
  }
}

export function calculateTotal(data) {
  const sumOfEntries = data.entries.reduce((sum, entry) => {
    // Check the operation type
    if (entry.operation === 'add') {
      return sum + entry.number;
    } else {
      return sum - entry.number;
    }
  }, 0);
  
  return INITIAL_TOTAL + sumOfEntries; // Changed from minus to plus because we handle the sign in the reduce
}

export function getAutocompleteSuggestions(input) {
  if (!input) return [];
  
  const lowercaseInput = input.toLowerCase();
  return AUTOCOMPLETE_KEYWORDS.filter(keyword => 
    keyword.toLowerCase().includes(lowercaseInput)
  );
}