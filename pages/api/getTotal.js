import { getData, calculateTotal } from '../../lib/data';

export default function handler(req, res) {
  try {
    const data = getData();
    const total = calculateTotal(data);
    res.status(200).json({ total });
  } catch (error) {
    res.status(500).json({ message: 'Error reading data' });
  }
}