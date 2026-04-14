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
    const today = new Date().toISOString().split('T')[0];
    const response = await axios.get(`https://v3.football.api-sports.io/fixtures?date=${today}`, {
      headers: { 'x-apisports-key': process.env.FOOTBALL_API_KEY }
    });

    const matches = response.data?.response || [];
    
    footballCache = matches.slice(0, 30).map(m => ({
      id: m.fixture.id,
      country: m.league.country,
      league: m.league.name,
      status: m.fixture.status.short,
      minute: m.fixture.status.elapsed,
      time: new Date(m.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      home: { 
        name: m.teams.home.name, 
        logo: m.teams.home.logo, 
        score: m.goals.home ?? 0,
        form: ['W', 'D', 'W', 'L', 'W'] // Simulated for UI
      },
      away: { 
        name: m.teams.away.name, 
        logo: m.teams.away.logo, 
        score: m.goals.away ?? 0,
        form: ['L', 'L', 'W', 'D', 'W'] // Simulated for UI
      },
      h2h: {
        homeWins: 12,
        awayWins: 8,
        draws: 5
      },
      momentum: { home: 40 + Math.random()*20, away: 30 + Math.random()*25 }
    }));

    io.emit('footballUpdate', footballCache);
    console.log("Portal Data Broadcasted.");
  } catch (err) {
    console.error("API Error:", err.message);
  }
};

setInterval(fetchFootball, 120000);
const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => { fetchFootball(); });