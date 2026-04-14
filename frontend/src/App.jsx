import React, { useState, useEffect, useMemo } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('https://sports-backend-2xim.onrender.com');

function App() {
  const [allMatches, setAllMatches] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [h2hData, setH2HData] = useState(null);
  const [isDark, setIsDark] = useState(true);

  // 1. Move this function HERE (Above the useEffect)
  const handleMatchSelection = async (match) => {
    if (!match) return;
    setSelectedMatch(match);
    if (match?.home?.id && match?.away?.id) {
      setH2HData(null); 
      try {
        const response = await fetch(`https://sports-backend-2xim.onrender.com/api/h2h/${match.home.id}/${match.away.id}`);
        const data = await response.json();
        setH2HData(data);
      } catch (error) {
        console.error("H2H Fetch Error:", error);
        setH2HData({ homeWins: 0, awayWins: 0, draws: 0, total: 0 });
      }
    }
  };

  // 2. Now the useEffect can safely see the function
  useEffect(() => {
    socket.on('footballUpdate', (data) => {
      const validData = Array.isArray(data) ? data : [];
      setAllMatches(validData);
      if (!selectedMatch && validData.length > 0) {
        handleMatchSelection(validData[0]);
      }
    });
    return () => socket.off();
  }, [selectedMatch]);

  // 3. Filtering logic
  const filteredMatches = useMemo(() => {
    return allMatches.filter(m => {
      const matchGeo = selectedCountry === 'All' || m.country === selectedCountry;
      const matchSearch = m.home?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.away?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchGeo && matchSearch;
    });
  }, [allMatches, selectedCountry, searchTerm]);

  const countryList = ['All', ...new Set(allMatches.map(m => m.country).filter(Boolean))];

  return (
    <div className={`app-container ${isDark ? 'dark' : 'light'}`}>
      
      {/* SIDEBAR */}
      <aside className="main-sidebar">
        <div className="logo-section">
          <h2 className="logo">GOAL<span>GRID</span></h2>
        </div>
        <nav className="side-nav">
          <p className="section-label">COUNTRIES</p>
          <div className="country-scroll">
            {countryList.map(c => (
              <button 
                key={c} 
                className={`country-btn ${selectedCountry === c ? 'active' : ''}`}
                onClick={() => setSelectedCountry(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="content-hub">
        <header className="top-bar">
          <div className="search-wrapper">
            <input 
              type="text" 
              placeholder="Search team or league..." 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="theme-toggle" onClick={() => setIsDark(!isDark)}>
            {isDark ? '☀️' : '🌙'}
          </button>
        </header>

        <section className="premium-banner">
          <div className="banner-info">
            <span className="badge">PRO ACCESS</span>
            <h1>Football Analytics 2026</h1>
            <p>Live stats and deep-dive historical H2H data.</p>
          </div>
        </section>

        <section className="match-display">
          {filteredMatches.map(m => (
            <div 
              key={m.id} 
              className={`match-card ${selectedMatch?.id === m.id ? 'highlight' : ''}`}
              onClick={() => handleMatchSelection(m)}
            >
              <div className="card-top">
                <span className="league-name">{m.league}</span>
                <span className="time-pill">{m.status === 'NS' ? m.time : `${m.minute}'`}</span>
              </div>
              <div className="card-body">
                <div className="team">
                  <img src={m.home?.logo} alt="" />
                  <p>{m.home?.name}</p>
                </div>
                <div className="center-score">
                  <span className="score">{m.home?.score} - {m.away?.score}</span>
                </div>
                <div className="team">
                  <img src={m.away?.logo} alt="" />
                  <p>{m.away?.name}</p>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* INSIGHTS PANEL */}
      <aside className="insights-drawer">
        <div className="insights-card">
          <h3>Analysis Center</h3>
          {selectedMatch ? (
            <div className="data-stack">
              <div className="h2h-summary">
                <p>Historical H2H</p>
                {h2hData ? (
                  <div className="h2h-visual">
                    <div className="h2h-labels">
                      <span>Wins: {h2hData.homeWins}</span>
                      <span>Draws: {h2hData.draws}</span>
                      <span>Wins: {h2hData.awayWins}</span>
                    </div>
                    <div className="h2h-bar-container">
                      <div className="h2h-seg h-w" style={{width: `${(h2hData.homeWins/h2hData.total)*100 || 33}%`}}></div>
                      <div className="h2h-seg draw" style={{width: `${(h2hData.draws/h2hData.total)*100 || 34}%`}}></div>
                      <div className="h2h-seg a-w" style={{width: `${(h2hData.awayWins/h2hData.total)*100 || 33}%`}}></div>
                    </div>
                  </div>
                ) : <div className="shimmer">Analyzing history...</div>}
              </div>

              <div className="momentum-gauge">
                <p>Match Pressure</p>
                <div className="gauge-track">
                  <div className="gauge-fill" style={{width: `${selectedMatch.momentum?.home}%`}}></div>
                </div>
              </div>
            </div>
          ) : <p>Select a match to unlock insights</p>}
        </div>
      </aside>
    </div>
  );
}

export default App;