import React, { useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

import SearchFilters from '../components/SearchFilters';
import SearchResults from '../components/SearchResults';

const SearchPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // הפונקציה שמתבצעת כשמבצעים חיפוש
  const handleSearch = async ({ fromDate, toDate, user, campus, type, text }) => {
    setLoading(true);
    try {
      // שליפת כל ההערות
      const snapshot = await getDocs(collection(db, 'notes'));

      // המרה למבנה נוח לעיבוד
      const allNotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // סינון לפי השדות
      const filtered = allNotes.filter(note => {
        const dateStr = note.date || '';
        const from = fromDate ? fromDate.replaceAll('-', '') : null;
        const to = toDate ? toDate.replaceAll('-', '') : null;

        const matchDate = (!from || dateStr >= from) && (!to || dateStr <= to);
        const matchUser = !user || note.userRef?.id === user;
        const matchCampus = !campus || note.campusRef?.id === campus;
        const matchType = !type || note.commentTypeRef?.id === type;
        const matchText = !text || (note.text?.includes(text));

        return matchDate && matchUser && matchCampus && matchType && matchText;
      });

      setResults(filtered);
    } catch (error) {
      console.error('שגיאה במהלך החיפוש:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">חיפוש הערות ביומן</h1>

      <SearchFilters onSearch={handleSearch} />

      {loading && <p className="mt-6 text-center">טוען תוצאות...</p>}

      {!loading && results.length > 0 && (
        <SearchResults results={results} />
      )}

      {!loading && results.length === 0 && (
        <p className="mt-6 text-center">לא נמצאו תוצאות</p>
      )}
    </div>
  );
};

export default SearchPage;
