import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('https://sports-backend-2xim.onrender.com'); // Keep your Render URL here!

function App() {
  const [isConnected, setIsConnected] = useState(false);
  // Notice these start as empty arrays [] instead of null now
  const [footballData, setFootballData] = useState([]);
  const [cricketData, setCricketData] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'football', or 'cricket'

  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('footballUpdate', (data) => setFootballData(data || []));
    socket.on('cricketUpdate', (data) => setCricketData(data || []));

    return () => {
      socket.off('connect'); socket.off('disconnect');
      socket.off('footballUpdate'); socket.off('cricketUpdate');
    };
  }, []);

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3rem', margin: '0 0 15px 0', letterSpacing: '-1px' }}>⚡ Live Sports Central</h1>
        
        {/* Sleek Connection Pill (This fixes the unused variable error!) */}
        <div style={{ 
          display: 'inline-flex', alignItems: 'center', gap: '8px', 
          background: isConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          padding: '8px 16px', borderRadius: '20px',
          color: isConnected ? '#34d399' : '#f87171', fontWeight: '600', fontSize: '0.85rem'
        }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: isConnected ? '#34d399' : '#f87171' }}></span>
          {isConnected ? "System Online" : "Connecting to feeds..."}
        </div>
      </div>

      {/* NEW: TAB NAVIGATION */}
      <div className="tab-container">
        <button className={`nav-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
          🌍 All Matches
        </button>
        <button className={`nav-tab ${activeTab === 'football' ? 'active' : ''}`} onClick={() => setActiveTab('football')}>
          ⚽ Football ({footballData.length})
        </button>
        <button className={`nav-tab ${activeTab === 'cricket' ? 'active' : ''}`} onClick={() => setActiveTab('cricket')}>
          🏏 Cricket ({cricketData.length})
        </button>
      </div>

      <div className="match-grid">
        
        {/* FOOTBALL SECTION - Only show if tab is 'all' or 'football' */}
        {(activeTab === 'all' || activeTab === 'football') && footballData.map((match) => (
          <div key={match.id} className="sport-card football-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#94a3b8', fontSize: '0.8rem', letterSpacing: '1px' }}>⚽ FOOTBALL</h3>
              <div className="live-badge"><div className="live-dot"></div>{match.minute}'</div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <img src={match.homeLogo} alt="Home" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                <h4 style={{ margin: '10px 0 0 0', fontSize: '0.9rem' }}>{match.homeTeam}</h4>
              </div>
              
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div className="score-box" style={{ fontSize: '2rem', padding: '10px 20px', color: '#3b82f6' }}>
                  {match.homeScore} - {match.awayScore}
                </div>
              </div>

              <div style={{ flex: 1, textAlign: 'center' }}>
                <img src={match.awayLogo} alt="Away" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                <h4 style={{ margin: '10px 0 0 0', fontSize: '0.9rem' }}>{match.awayTeam}</h4>
              </div>
            </div>
          </div>
        ))}

        {/* CRICKET SECTION - Only show if tab is 'all' or 'cricket' */}
        {(activeTab === 'all' || activeTab === 'cricket') && cricketData.map((match) => (
          <div key={match.id} className="sport-card cricket-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#94a3b8', fontSize: '0.8rem', letterSpacing: '1px' }}>🏏 CRICKET</h3>
              <div className="live-badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
                <div className="live-dot" style={{ background: '#10b981' }}></div> LIVE
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>{match.title}</h2>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '15px', borderRadius: '12px' }}>
                <h3 style={{ margin: '0', color: '#10b981', fontSize: '1rem' }}>{match.status}</h3>
              </div>
              <p style={{ margin: '15px 0 0 0', color: '#64748b', fontSize: '0.8rem' }}>📍 {match.venue}</p>
            </div>
          </div>
        ))}

        {/* If no matches are live at all */}
        {footballData.length === 0 && cricketData.length === 0 && (
           <div style={{ textAlign: 'center', color: '#94a3b8', gridColumn: '1 / -1', padding: '40px' }}>
              <h2>Waiting for live feeds to populate...</h2>
           </div>
        )}

      </div>
    </div>
  );
}

export default App;