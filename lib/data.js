import clientPromise from './mongodb';

const INITIAL_TOTAL = 50000;

export async function getData() {
  try {
    const client = await clientPromise;
    const db = client.db('sum');
    const entries = await db.collection('entries').find({}).toArray();
    
    // Convert MongoDB documents to plain objects and convert _id to string
    const serializedEntries = entries.map(entry => ({
      ...entry,
      _id: entry._id.toString(), // Convert ObjectId to string
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