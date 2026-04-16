import React, { useMemo, useState } from 'react';
import './AppShell.css';
import ViolenceAnalytics from './features/violence-analytics/ViolenceAnalytics';
import SdgConflictDashboard from './features/SDG-indicators/sdgConflictDashBoard';
import WarUpdatesFeature from './features/SDG-indicators/WarUpdatesFeature';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

function App() {
  const tabs = useMemo(
    () => [
      { key: 'violence', label: 'Violence analytics' },
      { key: 'feature2', label: 'SDG indicators' },
      { key: 'warUpdates', label: 'War updates' }
    
    ],
    []
  );

  const [activeTab, setActiveTab] = useState(tabs[0].key);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken') || '');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('loggedInRole') || 'user');
  const [loggedInEmail, setLoggedInEmail] = useState(() => localStorage.getItem('loggedInEmail') || '');

  const isLoggedIn = Boolean(authToken && loggedInEmail);

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Login failed.');
      }

      setLoginError('');
      setAuthMessage('');
      setAuthToken(result.token);
      setUserRole(result.user.role);
      setLoggedInEmail(result.user.email);

      localStorage.setItem('authToken', result.token);
      localStorage.setItem('loggedInRole', result.user.role);
      localStorage.setItem('loggedInEmail', result.user.email);

      setPassword('');
    } catch (error) {
      setAuthMessage('');
      setLoginError(error.message || 'Unable to sign in right now.');
    }
  };

  const handleSignUp = async (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setAuthMessage('');
      setLoginError('Email and password are required.');
      return;
    }

    if (password !== confirmPassword) {
      setAuthMessage('');
      setLoginError('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Unable to create account.');
      }

      setLoginError('');
      setAuthMessage(result.message || 'Account created. You can sign in now.');
      setPassword('');
      setConfirmPassword('');
      setIsSignUpMode(false);
    } catch (error) {
      setAuthMessage('');
      setLoginError(error.message || 'Unable to create account.');
    }
  };

  const toggleAuthMode = () => {
    setIsSignUpMode((prev) => !prev);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setLoginError('');
    setAuthMessage('');
  };

  const handleLogout = () => {
    setAuthToken('');
    setUserRole('user');
    setLoggedInEmail('');
    localStorage.removeItem('authToken');
    localStorage.removeItem('loggedInRole');
    localStorage.removeItem('loggedInEmail');
  };

  const content = (() => {
    switch (activeTab) {
      case 'violence':
        return <ViolenceAnalytics />;
      case 'feature2':
        return <SdgConflictDashboard />;
      case 'warUpdates':
        return (
          <WarUpdatesFeature
            authToken={authToken}
            userRole={userRole}
            currentUser={loggedInEmail}
          />
        );
    
      default:
        return null;
    }
  })();

  if (!isLoggedIn) {
    return (
      <div className="loginPage">
        <div className="loginCard">
          <h1>{isSignUpMode ? 'Create account' : 'OAuth Login'}</h1>
          <p className="loginHint">{isSignUpMode ? 'Create an account.' : 'Welcome User!'}</p>

          <form className="loginForm" onSubmit={isSignUpMode ? handleSignUp : handleLogin}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter email"
              autoComplete="off"
              required
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              autoComplete="off"
              required
            />

            {isSignUpMode ? (
              <>
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm password"
                  autoComplete="off"
                  required
                />
              </>
            ) : null}

            {loginError ? <p className="loginError">{loginError}</p> : null}
            {authMessage ? <p className="loginSuccess">{authMessage}</p> : null}

            <button type="submit" className="loginButton">
              {isSignUpMode ? 'Sign up' : 'Sign in'}
            </button>

            <button type="button" className="authSwitchButton" onClick={toggleAuthMode}>
              {isSignUpMode ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </form>
        </div>
      </div>
    );
  }

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
            <button type="button" className="navButton" onClick={handleLogout}>
              Logout ({loggedInEmail} - {userRole})
            </button>
          </div>
        </div>
      </div>

      <main className="main">{content}</main>
    </div>
  );
}

export default App;
