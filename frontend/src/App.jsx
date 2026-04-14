import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('https://sports-backend-2xim.onrender.com');

function App() {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null); // New State
  const [isDark, setIsDark] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.on('connect', () => setConnected(true));
    socket.on('footballUpdate', (data) => {
      setMatches(data || []);
      // Auto-select the first match if nothing is selected
      if (!selectedMatch && data?.length > 0) setSelectedMatch(data[0]);
    });
    return () => socket.off();
  }, [selectedMatch]);

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
            <div 
              key={m.id} 
              className={`pro-match-card ${selectedMatch?.id === m.id ? 'selected' : ''}`}
              onClick={() => setSelectedMatch(m)}
            >
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
            <div className="empty-state"><div className="spinner"></div><p>Scanning stadiums...</p></div>
          )}
        </section>
      </main>

      {/* 3. INSIGHTS PANEL (DYNAMIC) */}
      <aside className="insights-panel">
        <div className="glass-panel momentum-box">
          <h4>Match Insight</h4>
          {selectedMatch ? (
            <div className="insight-content">
              <div className="mini-vs">
                <span>{selectedMatch.home.name}</span>
                <span className="vs-tag">VS</span>
                <span>{selectedMatch.away.name}</span>
              </div>
              
              <div className="stat-row">
                <p>Win Probability</p>
                <div className="momentum-bar">
                  <div className="fill home-fill" style={{width: '45%'}}></div>
                  <div className="fill away-fill" style={{width: '35%'}}></div>
                </div>
              </div>

              <div className="quick-stats">
                <div className="stat-pill">Attacks: 42</div>
                <div className="stat-pill">Corners: 5</div>
              </div>
            </div>
          ) : (
            <p className="hint">Select a match to view analytics.</p>
          )}
        </div>
      </aside>
    </div>
  );
}

export default App;