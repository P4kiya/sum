import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { number, comment } = req.body;
    
    const client = await clientPromise;
    const db = client.db('sum');
    
    // Create new entry with current date
    const newEntry = {
      number: Number(number),
      comment,
      date: new Date().toISOString(),
      id: Date.now() // unique identifier
    };
    
    // Add new entry to MongoDB
    await db.collection('entries').insertOne(newEntry);
    
    // Get all entries to calculate total
    const entries = await db.collection('entries').find({}).toArray();
    const serializedEntries = entries.map(entry => ({
      ...entry,
      _id: entry._id.toString(),
    }));
    const total = 50000 - serializedEntries.reduce((sum, entry) => sum + entry.number, 0);
    
    res.status(200).json({ total, message: 'Entry saved successfully' });
  } catch (error) {
    console.error('Error saving entry:', error);
    res.status(500).json({ message: 'Error saving entry' });
  }
}