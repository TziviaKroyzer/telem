import React, { useEffect, useState } from 'react';
import { getDoc } from 'firebase/firestore';

const SearchResults = ({ results }) => {
  const [enrichedResults, setEnrichedResults] = useState([]);

  useEffect(() => {
    const enrich = async () => {
      const promises = results.map(async (note) => {
        const userSnap = note.user ? await getDoc(note.user) : null;
        const campusSnap = note.campus ? await getDoc(note.campus) : null;
        const typeSnap = note.commentType ? await getDoc(note.commentType) : null;

        const userData = userSnap?.exists() ? userSnap.data() : null;
        const fullName =
          userData && (userData.firstName || userData.lastName)
            ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
            : "ללא";

        return {
          ...note,
          user: fullName,
          campus: campusSnap?.exists() ? campusSnap.data().name : "לא ידוע",
          commentType: typeSnap?.exists() ? typeSnap.data().name : "לא מוגדר",
        };
      });

      const enriched = await Promise.all(promises);
      setEnrichedResults(enriched);
    };

    if (results.length > 0) enrich();
    else setEnrichedResults([]);
  }, [results]);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-2">תוצאות:</h2>
      {enrichedResults.length === 0 ? (
        <p>אין תוצאות להצגה</p>
      ) : (
        <ul className="space-y-4">
          {enrichedResults.map(note => (
            <li key={note.id} className="p-4 border rounded shadow-sm bg-white">
              <p><strong>תאריך:</strong> {note.date}</p>
              <p><strong>טקסט:</strong> {note.text}</p>
              <p><strong>משתמש:</strong> {note.user}</p>
              <p><strong>קמפוס:</strong> {note.campus}</p>
              <p><strong>סוג הערה:</strong> {note.commentType}</p>
              <p><strong>מזהה:</strong> {note.id}</p>
              {note.files?.length > 0 && (
                <div className="mt-2">
                  <strong>קבצים:</strong>
                  <ul className="list-disc pl-4">
                    {note.files.map((url, i) => (
                      <li key={i}>
                        <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchResults;
