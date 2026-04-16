import React, { useMemo, useState } from 'react';
import './AppShell.css';
import ViolenceAnalytics from './features/violence-analytics/ViolenceAnalytics';
import SdgConflictDashboard from './features/SDG-indicators/sdgConflictDashBoard';
import loginUsers from './loginUsers.json';

function App() {
  const tabs = useMemo(
    () => [
      { key: 'violence', label: 'Violence analytics' },
      { key: 'feature2', label: 'SDG indicators' }
    
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
  const [localUsers, setLocalUsers] = useState(() => {
    try {
      const storedUsers = localStorage.getItem('customLoginUsers');
      const parsedUsers = storedUsers ? JSON.parse(storedUsers) : [];
      return Array.isArray(parsedUsers) ? parsedUsers : [];
    } catch (error) {
      return [];
    }
  });
  const [loggedInEmail, setLoggedInEmail] = useState(() => localStorage.getItem('loggedInEmail') || '');
  const allUsers = useMemo(() => [...loginUsers, ...localUsers], [localUsers]);

  const isLoggedIn = Boolean(loggedInEmail);

  const handleLogin = (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const matchedUser = allUsers.find(
      (user) => user.email.toLowerCase() === normalizedEmail && user.password === password
    );

    if (!matchedUser) {
      setAuthMessage('');
      setLoginError('Invalid email or password.');
      return;
    }

    setLoginError('');
    setAuthMessage('');
    setLoggedInEmail(matchedUser.email);
    localStorage.setItem('loggedInEmail', matchedUser.email);
    setPassword('');
  };

  const handleSignUp = (event) => {
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

    const emailExists = allUsers.some((user) => user.email.toLowerCase() === normalizedEmail);
    if (emailExists) {
      setAuthMessage('');
      setLoginError('This email already exists. Please sign in.');
      return;
    }

    const nextUsers = [...localUsers, { email: normalizedEmail, password }];
    setLocalUsers(nextUsers);
    localStorage.setItem('customLoginUsers', JSON.stringify(nextUsers));

    setLoginError('');
    setAuthMessage('Account created. You can sign in now.');
    setPassword('');
    setConfirmPassword('');
    setIsSignUpMode(false);
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
    setLoggedInEmail('');
    localStorage.removeItem('loggedInEmail');
  };

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

  if (!isLoggedIn) {
    return (
      <div className="loginPage">
        <div className="loginCard">
          <h1>{isSignUpMode ? 'Create account' : 'OAuth Login'}</h1>
          <p className="loginHint">
            {isSignUpMode
              ? 'Create a local account for this browser.'
              : 'Welcome User!'}
          </p>

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
              Logout ({loggedInEmail})
            </button>
          </div>
        </div>
      </div>

      <main className="main">{content}</main>
    </div>
  );
}

export default App;
