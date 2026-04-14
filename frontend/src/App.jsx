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
    <div className={`app-canvas ${isDark ? 'dark-theme' : 'light-theme'}`}>
      
      {/* 1. FLOATING GLASS SIDEBAR */}
      <aside className="glass-sidebar">
        <div className="sidebar-top">
          <div className="brand-logo">⚽ SCORE<span>HUB</span></div>
          <nav className="nav-menu">
            <p className="nav-label">Main Menu</p>
            <button className="nav-item active">🔥 Live Feed</button>
            <button className="nav-item">🏆 Leagues</button>
            <button className="nav-item">📅 Schedule</button>
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="settings-card">
            <p>Appearance</p>
            <button className="theme-toggle-btn" onClick={() => setIsDark(!isDark)}>
              {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN FEED */}
      <main className="main-feed">
        <header className="feed-header">
          <div className="header-info">
            <h1>Live Football</h1>
            <p>Real-time updates from global pitches</p>
          </div>
          <div className={`connection-status ${connected ? 'is-online' : 'is-offline'}`}>
            {connected ? "● System Live" : "○ Reconnecting..."}
          </div>
        </header>

        <section className="match-grid">
          {matches.length > 0 ? matches.map(m => (
            <div key={m.id} className="pro-match-card">
              <div className="card-inner">
                <div className="league-info">
                  <span className="league-badge">{m.league}</span>
                  <span className="match-clock">
                    {m.status === 'NS' ? m.time : `${m.minute}'`}
                    {m.status !== 'NS' && m.status !== 'FT' && <span className="pulse-dot"></span>}
                  </span>
                </div>
                
                <div className="scoreboard">
                  <div className="team home">
                    <img src={m.home.logo} alt="" className="team-logo" />
                    <span className="team-name">{m.home.name}</span>
                  </div>
                  
                  <div className="live-score">
                    <span className="score-num">{m.home.score}</span>
                    <span className="score-divider">:</span>
                    <span className="score-num">{m.away.score}</span>
                  </div>

                  <div className="team away">
                    <img src={m.away.logo} alt="" className="team-logo" />
                    <span className="team-name">{m.away.name}</span>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="empty-state">
              <div className="spinner"></div>
              <p>Scanning global stadiums...</p>
            </div>
          )}
        </section>
      </main>

      {/* 3. INSIGHTS PANEL */}
      <aside className="insights-panel">
        <div className="glass-panel">
          <h4>Match Momentum</h4>
          <p className="hint">Select a match to see live pressure gauges.</p>
        </div>
      </aside>
    </div>
  );
}

export default App;