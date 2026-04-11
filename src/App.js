import React, { useMemo, useState } from 'react';
import './AppShell.css';
import ViolenceAnalytics from './features/violence-analytics/ViolenceAnalytics';

function App() {
  const tabs = useMemo(
    () => [
      { key: 'violence', label: 'Violence analytics' },
      { key: 'feature2', label: 'Feature 2' },
      { key: 'feature3', label: 'Feature 3' },
      { key: 'feature4', label: 'Feature 4' },
    ],
    []
  );

  const [activeTab, setActiveTab] = useState(tabs[0].key);

  const content = (() => {
    switch (activeTab) {
      case 'violence':
        return <ViolenceAnalytics />;
      case 'feature2':
        return (
          <div className="placeholder">
            <h2>Feature 2</h2>
            <p>Coming soon.</p>
          </div>
        );
      case 'feature3':
        return (
          <div className="placeholder">
            <h2>Feature 3</h2>
            <p>Coming soon.</p>
          </div>
        );
      case 'feature4':
        return (
          <div className="placeholder">
            <h2>Feature 4</h2>
            <p>Coming soon.</p>
          </div>
        );
      default:
        return null;
    }
  })();

  return (
    <div className="appShell">
      <div className="topBar">
        <div className="topBarInner">
          <div className="brand">My App</div>
          <div className="nav">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                className={`navButton ${activeTab === t.key ? 'navButtonActive' : ''}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="main">{content}</main>
    </div>
  );
}

export default App;
