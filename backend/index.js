require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios'); 

const app = express();
const server = http.createServer(app);
app.use(cors());

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// --- FIX 1: Cache the latest data in memory ---
let cachedFootballData = null;
let cachedCricketData = null;
let connectedUsers = 0; // FIX 2: Track active users

app.get('/', (req, res) => res.send('Live Sports Server Online!'));

io.on('connection', (socket) => {
  connectedUsers++;
  console.log(`User joined. Active watchers: ${connectedUsers}`);

  // FIX 1: Instantly send the cached data so new users don't wait 60 seconds
  if (cachedFootballData) socket.emit('footballUpdate', cachedFootballData);
  if (cachedCricketData) socket.emit('cricketUpdate', cachedCricketData);

  socket.on('disconnect', () => {
    connectedUsers--;
    console.log(`User left. Active watchers: ${connectedUsers}`);
  });
});

setInterval(async () => {
  if (connectedUsers === 0) return; 

  try {
    /* --- MULTI-MATCH FOOTBALL DATA --- */
    try {
      const footballRes = await axios.get('https://v3.football.api-sports.io/fixtures?live=all', {
        headers: { 'x-apisports-key': process.env.FOOTBALL_API_KEY }
      });
      const footballMatches = footballRes.data?.response || [];
      
      // Grab up to the top 5 live matches instead of just 1
      cachedFootballData = footballMatches.slice(0, 5).map(match => ({
        id: match.fixture.id,
        homeTeam: match.teams?.home?.name || "Unknown",
        homeLogo: match.teams?.home?.logo || "",
        awayTeam: match.teams?.away?.name || "Unknown",
        awayLogo: match.teams?.away?.logo || "",
        homeScore: match.goals?.home || 0,
        awayScore: match.goals?.away || 0,
        minute: match.fixture?.status?.elapsed || "HT"
      }));
      io.emit('footballUpdate', cachedFootballData);
    } catch (error) { console.log("Football API Error"); }

    /* --- MULTI-MATCH CRICKET DATA --- */
    try {
      const cricketRes = await axios.get(`https://api.cricapi.com/v1/currentMatches?apikey=${process.env.CRICKET_API_KEY}&offset=0`);
      const cricketMatches = cricketRes.data?.data || [];
      
      // Grab up to the top 3 live cricket matches
      cachedCricketData = cricketMatches.slice(0, 3).map(match => ({
        id: match.id,
        title: match.name || "Live Match",
        status: match.status || "In Progress",
        venue: match.venue || "TBD"
      }));
      io.emit('cricketUpdate', cachedCricketData);
    } catch (error) { console.log("Cricket API Error"); }

  } catch (error) { console.error("Critical Server Error"); }
}, 60000);
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}.`);
});