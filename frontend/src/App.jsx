import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('https://sports-backend-2xim.onrender.com');

function App() {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isDark, setIsDark] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.on('connect', () => setConnected(true));
    socket.on('footballUpdate', (data) => {
      setMatches(data || []);
      if (!selectedMatch && data?.length > 0) setSelectedMatch(data[0]);
    });
    return () => socket.off();
  }, [selectedMatch]);

  return (
    <div className={`app-canvas ${isDark ? 'dark-theme' : 'light-theme'}`}>
      <aside className="glass-sidebar">
        <div className="sidebar-top">
          <div className="brand-logo">⚽ SCORE<span>HUB</span></div>
          <nav className="nav-menu">
            <p className="nav-label">Main Menu</p>
            <button className="nav-item active">🔥 Live Feed</button>
            <button className="nav-item">🏆 Leagues</button>
          </nav>
        </div>
        <div className="sidebar-bottom">
          <button className="theme-toggle-btn" onClick={() => setIsDark(!isDark)}>
            {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      </aside>

      <main className="main-feed">
        <header className="feed-header">
          <h1>Live Football</h1>
          <div className={`connection-status ${connected ? 'is-online' : 'is-offline'}`}>
            {connected ? "● System Live" : "○ Offline"}
          </div>
        </header>

        <section className="match-grid">
          {matches.map(m => (
            <div 
              key={m.id} 
              className={`pro-match-card ${selectedMatch?.id === m.id ? 'selected' : ''}`}
              onClick={() => setSelectedMatch(m)}
            >
              <div className="league-info">
                <span className="league-badge">{m.league}</span>
                <span className="match-clock">{m.status === 'NS' ? m.time : `${m.minute}'`}</span>
              </div>
              <div className="scoreboard">
                <div className="team">
                  <img src={m.home.logo} alt="" />
                  <span>{m.home.name}</span>
                </div>
                <div className="live-score">{m.home.score} : {m.away.score}</div>
                <div className="team">
                  <span>{m.away.name}</span>
                  <img src={m.away.logo} alt="" />
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>

      <aside className="insights-panel">
        <div className="glass-panel">
          <h4>Match Insight</h4>
          {selectedMatch ? (
            <div className="insight-content">
              <div className="mini-vs">
                <p>{selectedMatch.home.name} vs {selectedMatch.away.name}</p>
              </div>
              
              <div className="stat-row">
                <p>Win Probability</p>
                <div className="momentum-bar">
                  <div className="fill home-fill" style={{width: `${selectedMatch.momentum.home}%`}}></div>
                  <div className="fill away-fill" style={{width: `${selectedMatch.momentum.away}%`}}></div>
                </div>
              </div>

              <div className="quick-stats">
                <div className="stat-pill">Total Attacks: {selectedMatch.home.attacks + selectedMatch.away.attacks}</div>
                <div className="stat-pill">Corners: {selectedMatch.home.corners + selectedMatch.away.corners}</div>
              </div>
            </div>
          ) : <p>Select a match</p>}
        </div>
      </aside>
    </div>
  );
}

export default App;