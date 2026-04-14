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
    // 1. Try fetching LIVE matches first
    let response = await axios.get('https://v3.football.api-sports.io/fixtures?live=all', {
      headers: { 'x-apisports-key': process.env.FOOTBALL_API_KEY }
    });

    let matches = response.data?.response || [];

    // 2. SMART FALLBACK: If no live matches, fetch the next 10 upcoming games
    if (matches.length === 0) {
      console.log("No live matches. Fetching upcoming fixtures...");
      const upcoming = await axios.get('https://v3.football.api-sports.io/fixtures?next=10', {
        headers: { 'x-apisports-key': process.env.FOOTBALL_API_KEY }
      });
      matches = upcoming.data?.response || [];
    }
    
    footballCache = matches.map(m => ({
      id: m.fixture.id,
      league: m.league.name,
      home: { name: m.teams.home.name, logo: m.teams.home.logo, score: m.goals.home ?? 0 },
      away: { name: m.teams.away.name, logo: m.teams.away.logo, score: m.goals.away ?? 0 },
      status: m.fixture.status.short, 
      minute: m.fixture.status.elapsed || 0,
      timestamp: m.fixture.timestamp
    }));

    io.emit('footballUpdate', footballCache);
    console.log(`Broadcasted ${footballCache.length} matches.`);
  } catch (err) {
    console.error("API Error:", err.message);
  }
};

// Update every 2 minutes to stay safe within free tier limits
setInterval(fetchFootball, 120000);

app.get('/', (req, res) => res.send('Football Backend with Fallback Active'));

const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  fetchFootball();
});