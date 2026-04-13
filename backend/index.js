1:  import { useState, useEffect } from 'react';
2:  import io from 'socket.io-client';
3:  import './App.css';
4:  
5:  const socket = io('https://sports-backend-2xim.onrender.com');
6:  
7:  function App() {
8:    const [isConnected, setIsConnected] = useState(false);
9:    const [footballData, setFootballData] = useState([]);
10:   const [cricketData, setCricketData] = useState([]);
11:   const [activeTab, setActiveTab] = useState('all');
12: 
13:   useEffect(() => {
14:     socket.on('connect', () => setIsConnected(true));
15:     socket.on('disconnect', () => setIsConnected(false));
16:     socket.on('footballUpdate', (data) => setFootballData(data || []));
17:     socket.on('cricketUpdate', (data) => setCricketData(data || []));
18: 
19:     return () => {
20:       socket.off('connect'); socket.off('disconnect');
21:       socket.off('footballUpdate'); socket.off('cricketUpdate');
22:     };
23:   }, []);
24: 
25:   return (
26:     <div className="dashboard-container">
27:       <header className="main-header">
28:         <h1>Live<span>Scores</span></h1>
29:         <div className={`status-pill ${isConnected ? 'online' : 'offline'}`}>
30:           {isConnected ? "● System Live" : "○ Reconnecting..."}
31:         </div>
32:       </header>
33: 
34:       <nav className="mini-tabs">
35:         <button className={activeTab === 'all' ? 'active' : ''} onClick={() => setActiveTab('all')}>All</button>
36:         <button className={activeTab === 'football' ? 'active' : ''} onClick={() => setActiveTab('football')}>Football</button>
37:         <button className={activeTab === 'cricket' ? 'active' : ''} onClick={() => setActiveTab('cricket')}>Cricket</button>
38:       </nav>
39: 
40:       <div className="match-grid">
41:         {(activeTab === 'all' || activeTab === 'football') && footballData.map((match) => (
42:           <div key={match.id} className="glass-card">
43:             <div className="card-top">
44:               <span className="league-tag">{match.league}</span>
45:               <span className="live-clock"><span className="pulse"></span> {match.minute}'</span>
46:             </div>
47:             <div className="scoreline">
48:               <div className="team">
49:                 <img src={match.homeLogo} alt="" />
50:                 <span className="name">{match.homeTeam}</span>
51:               </div>
52:               <div className="score-box">{match.homeScore} : {match.awayScore}</div>
53:               <div className="team">
54:                 <img src={match.awayLogo} alt="" />
55:                 <span className="name">{match.awayTeam}</span>
56:               </div>
57:             </div>
58:             <div className="card-bottom">📍 {match.venue}</div>
59:           </div>
60:         ))}
61: 
62:         {(activeTab === 'all' || activeTab === 'cricket') && cricketData.map((match) => (
63:           <div key={match.id} className="glass-card">
64:             <div className="card-top">
65:               <span className="league-tag">{match.league}</span>
66:               <div className="live-badge-mini">LIVE</div>
67:             </div>
68:             <div className="cricket-body">
69:               <h2 className="match-title">{match.title}</h2>
70:               <div className="status-box">{match.status}</div>
71:             </div>
72:             <div className="card-bottom">📍 {match.venue}</div>
73:           </div>
74:         ))}
75:       </div>
76:     </div>
77:   );
78: }
79: 
80: export default App;