import { useCallback, useEffect, useState } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

export default function WarUpdatesPanel({ authToken, userRole, currentUser }) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [posting, setPosting] = useState(false);

  const isAdmin = userRole === 'admin';

  const fetchUpdates = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/war-updates`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unable to load updates.');
      }

      setUpdates(Array.isArray(result.updates) ? result.updates : []);
    } catch (err) {
      setError(err.message || 'Unable to load updates.');
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    if (authToken) {
      fetchUpdates();
    }
  }, [authToken, fetchUpdates]);

  const handlePostUpdate = async (event) => {
    event.preventDefault();

    const trimmed = message.trim();
    if (!trimmed) {
      setError('Message is required.');
      return;
    }

    setPosting(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/war-updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ message: trimmed }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Unable to post update.');
      }

      setMessage('');
      setUpdates((prev) => [result.update, ...prev]);
    } catch (err) {
      setError(err.message || 'Unable to post update.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="sdgPanel sdgWarPanel">
      <div className="sdgWarHead">
        <div>
          <h3 className="sdgPanelTitle">War Updates Feed</h3>
          <p className="sdgSubtle">
            Signed in as {currentUser} ({userRole})
          </p>
        </div>
        <button type="button" className="sdgRefreshBtn" onClick={fetchUpdates} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh feed'}
        </button>
      </div>

      {isAdmin ? (
        <form className="sdgWarForm" onSubmit={handlePostUpdate}>
          <label htmlFor="war-message">Post a war update</label>
          <textarea
            id="war-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={3}
            placeholder="Write latest conflict update for users"
          />
          <button className="sdgPostBtn" type="submit" disabled={posting}>
            {posting ? 'Posting...' : 'Post message'}
          </button>
        </form>
      ) : (
        <p className="sdgSubtle">Read-only mode: only admins can publish updates.</p>
      )}

      {error ? <p className="sdgErrorText">{error}</p> : null}

      <div className="sdgWarList">
        {updates.length === 0 && !loading ? <p className="sdgSubtle">No updates yet.</p> : null}
        {updates.map((item) => (
          <article key={item.id} className="sdgWarItem">
            <p className="sdgWarMessage">{item.message}</p>
            <p className="sdgWarMeta">Posted by {item.author}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
