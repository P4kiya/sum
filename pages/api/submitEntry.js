import connectToDatabase from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { number, comment, operation } = req.body;
    const { db } = await connectToDatabase();
    
    const newEntry = {
      number: Math.abs(Number(number)),
      comment,
      date: new Date().toISOString(),
      operation
    };
    
    await db.collection('entries').insertOne(newEntry);
    
    const entries = await db.collection('entries').find({}).toArray();
    const total = entries.reduce((sum, entry) => {
      return entry.operation === 'add' ? sum + entry.number : sum - entry.number;
    }, 0);
    
    res.status(200).json({ total, message: 'Entry saved successfully' });
  } catch (error) {
    console.error('Error saving entry:', error);
    res.status(500).json({ message: 'Error saving entry' });
  }
}