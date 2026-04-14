const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let footballCache = [];

const fetchFootball = async () => {
  try {
    console.log("Checking for Live matches...");
    let response = await axios.get('https://v3.football.api-sports.io/fixtures?live=all', {
      headers: { 'x-apisports-key': process.env.FOOTBALL_API_KEY }
    });

    let matches = response.data?.response || [];

    // SMART FALLBACK: If 0 live matches, fetch ALL fixtures for today's date
    if (matches.length === 0) {
      console.log("No live games. Fetching today's full schedule...");
      const today = new Date().toISOString().split('T')[0]; 
      const upcoming = await axios.get(`https://v3.football.api-sports.io/fixtures?date=${today}`, {
        headers: { 'x-apisports-key': process.env.FOOTBALL_API_KEY }
      });
      matches = upcoming.data?.response || [];
    }
    
    // Map data and format time
    footballCache = matches.slice(0, 15).map(m => ({
      id: m.fixture.id,
      league: m.league.name,
      home: { name: m.teams.home.name, logo: m.teams.home.logo, score: m.goals.home ?? 0 },
      away: { name: m.teams.away.name, logo: m.teams.away.logo, score: m.goals.away ?? 0 },
      status: m.fixture.status.short, 
      minute: m.fixture.status.elapsed || 0,
      time: new Date(m.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    io.emit('footballUpdate', footballCache);
    console.log(`Success! Broadcasted ${footballCache.length} matches.`);
  } catch (err) {
    console.error("API Error:", err.message);
  }
};

// Fetch every 2 minutes
setInterval(fetchFootball, 120000);

app.get('/', (req, res) => res.send('Football Backend Active'));

const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  fetchFootball();
});