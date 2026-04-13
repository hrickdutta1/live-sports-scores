const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

let cachedFootballData = [];

const fetchScores = async () => {
  try {
    const res = await axios.get('https://v3.football.api-sports.io/fixtures?live=all', {
      headers: { 'x-apisports-key': process.env.FOOTBALL_API_KEY }
    });
    const matches = res.data?.response || [];
    cachedFootballData = matches.slice(0, 10).map(m => ({
      id: m.fixture.id,
      league: m.league?.name || "League",
      homeTeam: m.teams?.home?.name || "Home",
      homeLogo: m.teams?.home?.logo || "",
      awayTeam: m.teams?.away?.name || "Away",
      awayLogo: m.teams?.away?.logo || "",
      homeScore: m.goals?.home ?? 0,
      awayScore: m.goals?.away ?? 0,
      minute: m.fixture?.status?.elapsed || 0,
      venue: m.fixture?.venue?.name || "Stadium"
    }));
    io.emit('footballUpdate', cachedFootballData);
  } catch (err) {
    console.log("API Fetch Error");
  }
};

app.get('/', (req, res) => {
  res.status(200).send('SERVER_LIVE_SUCCESS');
});

setInterval(fetchScores, 60000);

const PORT = process.env.PORT || 10000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`==> Server listening on port ${PORT}`);
  fetchScores();
});