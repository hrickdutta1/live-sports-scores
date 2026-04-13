import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

// Your official Render link is now active!
const socket = io('https://sports-backend-2xim.onrender.com');

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [footballData, setFootballData] = useState([]);
  const [cricketData, setCricketData] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('sports_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('footballUpdate', (data) => setFootballData(data || []));
    socket.on('cricketUpdate', (data) => setCricketData(data || []));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('footballUpdate');
      socket.off('cricketUpdate');
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('sports_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
    );
  };

  const getSortedMatches = (matches) => {
    return [...matches].sort((a, b) => {
      const aFav = favorites.includes(a.id);
      const bFav = favorites.includes(b.id);
      return bFav - aFav; 
    });
  };

  return (
    <div className="dashboard-container">
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3.5rem', margin: '0 0 10px 0', fontWeight: '800' }}>⚡ Live Sports</h1>
        <div className={`connection-pill ${isConnected ? 'online' : 'offline'}`}>
          <span className="dot"></span>
          {isConnected ? "System Live" : "Connecting to Render..."}
        </div>
      </header>

      <nav className="tab-container">
        {['all', 'football', 'cricket'].map(tab => (
          <button 
            key={tab}
            className={`nav-tab ${activeTab === tab ? 'active' : ''}`} 
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'all' ? '🌍 All' : tab === 'football' ? `⚽ Football` : `🏏 Cricket`}
          </button>
        ))}
      </nav>

      <div className="match-grid">
        {(activeTab === 'all' || activeTab === 'football') && getSortedMatches(footballData).map((match) => (
          <div key={match.id} className={`sport-card football-card ${favorites.includes(match.id) ? 'is-fav' : ''}`}>
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button className={`fav-star ${favorites.includes(match.id) ? 'active' : ''}`} onClick={() => toggleFavorite(match.id)}>
                  ★
                </button>
                <span className="league-label">{match.league || "Global"}</span>
              </div>
              <div className="live-timer"><span className="pulse"></span> {match.minute}'</div>
            </div>
            <div className="match-content">
              <div className="team">
                <img src={match.homeLogo} alt="" />
                <p>{match.homeTeam}</p>
              </div>
              <div className="score-display">
                <span className="score-number">{match.homeScore}</span>
                <span className="score-divider">-</span>
                <span className="score-number">{match.awayScore}</span>
              </div>
              <div className="team">
                <img src={match.awayLogo} alt="" />
                <p>{match.awayTeam}</p>
              </div>
            </div>
          </div>
        ))}

        {(activeTab === 'all' || activeTab === 'cricket') && getSortedMatches(cricketData).map((match) => (
          <div key={match.id} className={`sport-card cricket-card ${favorites.includes(match.id) ? 'is-fav' : ''}`}>
             <div className="card-header">
                <button className={`fav-star ${favorites.includes(match.id) ? 'active' : ''}`} onClick={() => toggleFavorite(match.id)}>★</button>
                <div className="live-badge-cricket">LIVE</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>{match.title}</h2>
              <div className="status-container"><p>{match.status}</p></div>
              <p className="venue-text">📍 {match.venue}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;