import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { number, comment, operation } = req.body;
    const amount = Number(number);
    
    const client = await clientPromise;
    const db = client.db('sum');
    
    // Create new entry with current date
    const newEntry = {
      number: Math.abs(amount), // Store positive number for display purposes
      comment,
      date: new Date().toISOString(),
      id: Date.now(), // unique identifier
      operation // Store the operation type
    };
    
    // Add new entry to MongoDB
    await db.collection('entries').insertOne(newEntry);
    
    // Get all entries to calculate total
    const entries = await db.collection('entries').find({}).toArray();
    const serializedEntries = entries.map(entry => ({
      ...entry,
      _id: entry._id.toString(),
    }));
    
    // Calculate total - add or subtract based on operation field
    const total = serializedEntries.reduce((sum, entry) => {
      const entryAmount = entry.number;
      // If operation is 'add', add to the total, otherwise subtract
      if (entry.operation === 'add') {
        return sum + entryAmount;
      } else {
        return sum - entryAmount;
      }
    }, 50000);
    
    res.status(200).json({ total, message: 'Entry saved successfully' });
  } catch (error) {
    console.error('Error saving entry:', error);
    res.status(500).json({ message: 'Error saving entry' });
  }
}