const express = require("express");
const http = require("http");
const cors = require("cors");
const socketio = require("socket.io");
const passport = require("passport");
const session = require("express-session");
const authRoutes = require("./auth");
const leaderboardRoutes = require("./leaderboard");

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
  }
});

app.use(cors());
app.use(express.json());
app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

const players = {};

io.on("connection", socket => {
  players[socket.id] = { id: socket.id, x: 150 };

  socket.on("joinGame", () => {
    io.emit("updatePlayers", players);
  });

  socket.on("playerMove", data => {
    if (players[socket.id]) {
      players[socket.id].x = data.x;
      io.emit("updatePlayers", players);
    }
  });

  socket.on("submitScore", async data => {
    try {
      await fetch("https://your-api-url/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    } catch (err) {
      console.log("Failed to save score:", err.message);
    }
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("updatePlayers", players);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
