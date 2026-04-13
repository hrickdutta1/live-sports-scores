import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('https://sports-backend-2xim.onrender.com');

function App() {
  const [matches, setMatches] = useState([]);
  const [isDark, setIsDark] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.on('connect', () => setConnected(true));
    socket.on('footballUpdate', (data) => setMatches(data || []));
    return () => socket.off();
  }, []);

  return (
    <div className={`app-shell ${isDark ? 'dark-theme' : 'light-theme'}`}>
      {/* COLUMN 1: SIDEBAR */}
      <aside className="sidebar">
        <div className="logo">⚽ SCORE<span>HUB</span></div>
        <ul className="league-list">
          <li>🏆 Premier League</li>
          <li>🇪🇸 La Liga</li>
          <li>🇮🇳 ISL</li>
        </ul>
      </aside>

      {/* COLUMN 2: FEED */}
      <main className="feed-container">
        <header className="feed-header">
          <h2>Live Football</h2>
          <span className={`status ${connected ? 'online' : 'offline'}`}>
            {connected ? "● Connected" : "○ Offline"}
          </span>
        </header>

        <div className="match-grid">
          {matches.length > 0 ? matches.map(m => (
            <div key={m.id} className="match-card">
              <div className="match-top">
                <span>{m.league}</span>
                <span className="live-tag">{m.minute}'</span>
              </div>
              <div className="score-row">
                <div className="team">
                   <img src={m.home.logo} alt="" />
                   <span>{m.home.name}</span>
                </div>
                <div className="score">{m.home.score} - {m.away.score}</div>
                <div className="team">
                   <span>{m.away.name}</span>
                   <img src={m.away.logo} alt="" />
                </div>
              </div>
            </div>
          )) : <p className="loading">Waiting for live match data...</p>}
        </div>
      </main>

      {/* COLUMN 3: SETTINGS */}
      <aside className="utils-bar">
        <div className="settings-panel">
          <h4>Settings</h4>
          <button className="theme-btn" onClick={() => setIsDark(!isDark)}>
            {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      </aside>
    </div>
  );
}

export default App;