import { useState } from 'react';
import { getData, calculateTotal } from '../lib/data';

export async function getServerSideProps() {
  const data = getData();
  const initialTotal = calculateTotal(data);
  return {
    props: { 
      initialTotal,
      initialEntries: data.entries 
    },
  };
}

export default function Home({ initialTotal, initialEntries }) {
  const [total, setTotal] = useState(initialTotal);
  const [entries, setEntries] = useState(initialEntries);
  const [number, setNumber] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/submitEntry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ number, comment }),
      });
      if (!res.ok) {
        throw new Error('Failed to submit entry');
      }
      const data = await res.json();
      setTotal(data.total);
      
      // Refresh the page to get updated entries
      window.location.reload();
      
      setNumber('');
      setComment('');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
            Credit: <span className="text-blue-600">{total}</span>
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="number" className="block text-sm font-medium text-gray-700">
                Amount
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  id="number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                  min="0"
                  max={total}
                />
              </div>
            </div>

            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                Comment
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Submit
            </button>
          </form>
        </div>

        {/* Entries List */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Historique</h2>
          <div className="space-y-4">
            {entries.slice().reverse().map((entry) => (
              <div key={entry.id} className="border-b border-gray-200 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">-{entry.number}</p>
                    <p className="text-gray-600">{entry.comment}</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(entry.date).toLocaleDateString()} {new Date(entry.date).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}