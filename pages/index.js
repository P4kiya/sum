import { useState, useMemo, useEffect, useRef } from 'react';
import { getData, calculateTotal } from '../lib/data';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { AUTOCOMPLETE_KEYWORDS } from '../lib/constants';

export async function getServerSideProps(context) {
  const data = await getData();
  const initialTotal = calculateTotal(data);
  return {
    props: { 
      initialTotal,
      initialEntries: data.entries 
    },
  };
}

// Move calculateDayTotal outside the component
const calculateDayTotal = (entries) => {
  return entries.reduce((sum, entry) => {
    const amount = Number(entry.number);
    return entry.operation === 'add' ? sum + amount : sum - amount;
  }, 0);
};

export default function Home({ initialTotal, initialEntries }) {
  // 1. All hooks declarations first
  const { data: session, status } = useSession();
  const router = useRouter();
  const [total, setTotal] = useState(initialTotal);
  const [entries, setEntries] = useState(initialEntries);
  const [number, setNumber] = useState('');
  const [comment, setComment] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [visibleDates, setVisibleDates] = useState(5);
  const [loading, setLoading] = useState(false);
  const loadMoreRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 2. useMemo hooks
  // Group entries by date
  const entriesByDate = useMemo(() => {
    const groupedEntries = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.date).toLocaleDateString();
      if (!groupedEntries[date]) {
        groupedEntries[date] = [];
      }
      groupedEntries[date].push(entry);
    });
    
    return groupedEntries;
  }, [entries]);
  
  // Sort dates for entries (newest first)
  const sortedDates = useMemo(() => {
    return Object.keys(entriesByDate).sort((a, b) => {
      // Convert date strings to Date objects for proper comparison
      const dateA = new Date(a.split('/').reverse().join('-'));
      const dateB = new Date(b.split('/').reverse().join('-'));
      return dateB - dateA; // Sort in descending order (newest first)
    });
  }, [entriesByDate]);

  // Get filtered entries based on selected date
  const filteredEntries = useMemo(() => {
    if (!selectedDate) return entries;
    return entriesByDate[selectedDate] || [];
  }, [selectedDate, entries, entriesByDate]);

  // 3. useEffect hook for infinite scroll
  // Intersection Observer setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !loading && sortedDates.length > visibleDates) {
          setLoading(true);
          // Simulate a small delay for better UX
          setTimeout(() => {
            setVisibleDates((prev) => Math.min(prev + 5, sortedDates.length));
            setLoading(false);
          }, 500);
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [loading, sortedDates.length, visibleDates]);

  // 4. Early returns using loading state from hooks
  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  // 5. Handler functions after all hooks
  const handleSubmitOperation = async (operation) => {
    // Validate inputs before submission
    if (!number || number <= 0 || !comment.trim()) {
      // Show an error message or alert
      alert("Please enter a valid amount and comment");
      return;
    }
    
    try {
      const res = await fetch('/api/submitEntry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          number, 
          comment,
          operation 
        }),
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

  const handleCommentChange = (e) => {
    const value = e.target.value;
    setComment(value);
    
    if (value.length >= 1) {
      const filtered = AUTOCOMPLETE_KEYWORDS.filter(keyword =>
        keyword.toLowerCase().startsWith(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setComment(suggestion);
    setShowSuggestions(false);
  };

  // 6. Component render
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="p-4 md:p-12">
        <div className="max-w-3xl mx-auto">
          {/* User Info & Sign Out */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Welcome, {session.user.username}</h2>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>

          {/* Balance and Form */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
              Solde : <span className="text-blue-600">{total}</span>
            </h1>
            
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <div>
                <label htmlFor="number" className="block text-sm font-medium text-gray-700">
                  Montant
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
                  Motif
                </label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    id="comment"
                    value={comment}
                    onChange={handleCommentChange}
                    onFocus={() => comment.length >= 1 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 300)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
                      <ul className="max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                        {suggestions.map((suggestion, index) => (
                          <li
                            key={index}
                            className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSuggestionClick(suggestion);
                            }}
                          >
                            <span className="block truncate">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => handleSubmitOperation('add')}
                  className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                >
                  <span className="mr-2">+</span> Add
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmitOperation('subtract')}
                  className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                >
                  <span className="mr-2">-</span> Subtract
                </button>
              </div>
            </form>
          </div>

          {/* Entries List */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Historique</h2>
            
            <div className="space-y-8">
              {sortedDates.slice(0, visibleDates).map(date => {
                const dayTotal = calculateDayTotal(entriesByDate[date]);
                return (
                  <div key={date} className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b flex justify-between items-center">
                      <div>
                        {date} <span className="text-sm text-gray-500 font-normal ml-2"> ( {entriesByDate[date].length} ) </span>
                      </div>
                      <div className={`font-semibold ${dayTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {dayTotal >= 0 ? '+' : ''}{dayTotal}
                      </div>
                    </h3>
                    <div className="space-y-4 pl-2">
                      {entriesByDate[date]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 20) // Limit entries per date to 20
                        .map((entry) => (
                        <div key={entry.id} className="border-b border-gray-100 pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-lg font-semibold text-gray-900">
                                {entry.operation === 'add' ? (
                                  <span className="text-green-600">+{entry.number}</span>
                                ) : (
                                  <span className="text-red-600">-{entry.number}</span>
                                )}
                              </p>
                              <p className="text-gray-600">{entry.comment}</p>
                            </div>
                            <p className="text-sm text-gray-500">
                              {new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {sortedDates.length === 0 && (
                <p className="text-center text-gray-500 py-4">No entries found</p>
              )}
              
              {/* Loading indicator and intersection observer target */}
              {sortedDates.length > visibleDates && (
                <div ref={loadMoreRef} className="text-center py-4">
                  {loading ? (
                    <div className="flex justify-center items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Scroll for more</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}