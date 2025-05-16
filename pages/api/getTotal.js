import { getData, calculateTotal } from '../../lib/data';

export default async function handler(req, res) {
  try {
    const data = await getData(); // Add await here
    const total = calculateTotal(data);
    res.status(200).json({ total });
  } catch (error) {
    res.status(500).json({ message: 'Error reading data' });
  }
}