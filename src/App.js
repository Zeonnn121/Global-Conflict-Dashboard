import React, { useMemo, useState } from 'react';
import './AppShell.css';
import ViolenceAnalytics from './features/violence-analytics/ViolenceAnalytics';
import SdgConflictDashboard from './features/SDG-indicators/sdgConflictDashBoard';

function App() {
  const tabs = useMemo(
    () => [
      { key: 'violence', label: 'Violence analytics' },
      { key: 'feature2', label: 'SDG indicators' }
    
    ],
    []
  );

  const [activeTab, setActiveTab] = useState(tabs[0].key);

  const content = (() => {
    switch (activeTab) {
      case 'violence':
        return <ViolenceAnalytics />;
      case 'feature2':
        return <SdgConflictDashboard />;
    
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
