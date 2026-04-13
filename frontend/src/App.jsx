import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('https://sports-backend-2xim.onrender.com');

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [footballData, setFootballData] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('footballUpdate', (data) => setFootballData(data || []));
    return () => { socket.off('connect'); socket.off('disconnect'); };
  }, []);

  return (
    <div className="app-container">
      {/* Sidebar: Top Leagues */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h3>Top leagues</h3>
        </div>
        <ul className="league-list">
          <li>🏆 FIFA World Cup</li>
          <li>🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League</li>
          <li>🇪🇺 Champions League</li>
          <li>🇪🇸 LaLiga</li>
          <li>🇮🇳 Indian Super League</li>
        </ul>
      </aside>

      {/* Main Content: Scores */}
      <main className="main-content">
        <header className="feed-header">
          <div className="status-badge">
            <span className={isConnected ? "online" : "offline"}>
              {isConnected ? "● System Live" : "○ Reconnecting..."}
            </span>
          </div>
          <div className="filter-tabs">
            <button className={activeTab === 'all' ? 'active' : ''} onClick={() => setActiveTab('all')}>Ongoing</button>
            <button className={activeTab === 'football' ? 'active' : ''} onClick={() => setActiveTab('football')}>Football</button>
          </div>
        </header>

        <div className="match-list">
          {footballData.length > 0 ? (
            footballData.map((match) => (
              <div key={match.id} className="match-row">
                <span className="match-time">{match.minute}'</span>
                <div className="match-main">
                  <div className="team-side home">
                    <span className="team-name">{match.homeTeam}</span>
                    <img src={match.homeLogo} alt="" className="mini-logo" />
                  </div>
                  <div className="score-area">
                    <span className="score-box">{match.homeScore} - {match.awayScore}</span>
                  </div>
                  <div className="team-side away">
                    <img src={match.awayLogo} alt="" className="mini-logo" />
                    <span className="team-name">{match.awayTeam}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-matches">No live matches at the moment. Checking for updates...</div>
          )}
        </div>
      </main>

      {/* Right Panel: News & Promo */}
      <aside className="right-panel">
        <div className="promo-box">
          <h4>Build your own XI</h4>
          <p>Try our lineup builder</p>
          <div className="pitch-icon">⚽</div>
        </div>
        <div className="news-box">
          <div className="news-img-placeholder">News Update</div>
          <p>Latest transfer rumors and injury news from the top leagues.</p>
        </div>
      </aside>
    </div>
  );
}

export default App;