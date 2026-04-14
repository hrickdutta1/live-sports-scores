import React, { useState, useEffect, useMemo } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('https://sports-backend-2xim.onrender.com');

function App() {
  const [allMatches, setAllMatches] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState('All');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isDark, setIsDark] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.on('connect', () => setConnected(true));
    socket.on('footballUpdate', (data) => {
      const validData = Array.isArray(data) ? data : [];
      setAllMatches(validData);
      // Auto-select first match on initial load if nothing is selected
      if (validData.length > 0 && !selectedMatch) {
        setSelectedMatch(validData[0]);
      }
    });
    return () => socket.off();
  }, [selectedMatch]);

  const filteredMatches = useMemo(() => {
    if (!allMatches) return [];
    return selectedLeague === 'All' 
      ? allMatches 
      : allMatches.filter(m => m?.league === selectedLeague);
  }, [allMatches, selectedLeague]);

  const handleLeagueChange = (league) => {
    setSelectedLeague(league);
    const newFiltered = league === 'All' 
      ? allMatches 
      : allMatches.filter(m => m?.league === league);
    setSelectedMatch(newFiltered.length > 0 ? newFiltered[0] : null);
  };

  const uniqueLeagues = ['All', ...new Set(allMatches.map(m => m?.league).filter(Boolean))];

  return (
    <div className={`app-canvas ${isDark ? 'dark-theme' : 'light-theme'}`}>
      <aside className="glass-sidebar">
        <div className="sidebar-top">
          <div className="brand-logo">⚽ SCORE<span>HUB</span></div>
          <nav className="nav-menu">
            <p className="nav-label">Browse Leagues</p>
            <div className="league-list-container">
              {uniqueLeagues.map(league => (
                <button 
                  key={league}
                  className={`nav-item ${selectedLeague === league ? 'active' : ''}`}
                  onClick={() => handleLeagueChange(league)}
                >
                  <span className="dot"></span> {league}
                </button>
              ))}
            </div>
          </nav>
        </div>
        <div className="sidebar-bottom">
          <button className="theme-toggle-btn" onClick={() => setIsDark(!isDark)}>
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </aside>

      <main className="main-feed">
        <header className="feed-header">
          <div>
            <h1>{selectedLeague} Matches</h1>
            <p className="subtitle">{filteredMatches.length} Matches Found</p>
          </div>
          <div className={`status-pill ${connected ? 'online' : 'offline'}`}>
            {connected ? "LIVE" : "CONNECTING..."}
          </div>
        </header>

        <section className="match-grid">
          {filteredMatches.length > 0 ? filteredMatches.map(m => (
            <div 
              key={m?.id} 
              className={`pro-match-card ${selectedMatch?.id === m?.id ? 'active-card' : ''}`}
              onClick={() => setSelectedMatch(m)}
            >
              <div className="card-tag">
                <span className="l-name">{m?.league}</span>
                <span className="m-time">{m?.status === 'NS' ? m?.time : `${m?.minute}'`}</span>
              </div>
              <div className="main-score-row">
                <div className="t-box">
                  <img src={m?.home?.logo} alt="" />
                  <span>{m?.home?.name}</span>
                </div>
                <div className="s-box">{m?.home?.score} - {m?.away?.score}</div>
                <div className="t-box">
                  <img src={m?.away?.logo} alt="" />
                  <span>{m?.away?.name}</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="no-data-msg">Scanning stadiums for matches...</div>
          )}
        </section>
      </main>

      <aside className="insights-panel">
        <div className="glass-panel">
          <h4 className="panel-title">Analysis</h4>
          {selectedMatch ? (
            <div className="analysis-box">
              <div className="teams-header">
                <span>{selectedMatch?.home?.name}</span>
                <span className="vs">VS</span>
                <span>{selectedMatch?.away?.name}</span>
              </div>
              <div className="momentum-section">
                <p>Win Probability</p>
                <div className="m-bar">
                  <div className="m-fill home" style={{width: `${selectedMatch?.momentum?.home || 50}%`}}></div>
                  <div className="m-fill away" style={{width: `${selectedMatch?.momentum?.away || 50}%`}}></div>
                </div>
              </div>
              <div className="stats-grid">
                <div className="stat-item">
                  <label>Total Attacks</label>
                  <span>{(selectedMatch?.home?.attacks || 0) + (selectedMatch?.away?.attacks || 0)}</span>
                </div>
                <div className="stat-item">
                  <label>Corners</label>
                  <span>{(selectedMatch?.home?.corners || 0) + (selectedMatch?.away?.corners || 0)}</span>
                </div>
              </div>
            </div>
          ) : <p className="select-prompt">Select a match to view data</p>}
        </div>
      </aside>
    </div>
  );
}

export default App;