import React from 'react';
import WarUpdatesPanel from './WarUpdatesPanel';
import './SdgConflictDashboard.css';

export default function WarUpdatesFeature({ authToken, userRole, currentUser }) {
  return (
    <div className="sdgDashboardWrap">
      <div className="sdgHeader">
        <div>
          <p className="sdgSubtle">Live conflict communication</p>
          <h1 className="sdgTitle">War Updates</h1>
          <p className="sdgDescription">
            Admins can publish updates. Users can view all messages in real time.
          </p>
        </div>
      </div>

      <WarUpdatesPanel
        authToken={authToken}
        userRole={userRole}
        currentUser={currentUser}
      />
    </div>
  );
}
