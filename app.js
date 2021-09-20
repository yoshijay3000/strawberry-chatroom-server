require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const router = require("./router");
const { addUser, removeUser, getUserData, getUsersInRoom } = require("./users");

const app = express();
const httpServer = http.createServer(app);

const PORT = process.env.PORT || 5000;
const ORIGIN = process.env.ORIGIN || "http://localhost:3000";

// middleware and router
app.use(cors());
app.use("/", router);

const io = require("socket.io")(httpServer, {
  cors: {
    origin: ORIGIN,
    methods: ["GET", "POST"],
  },
});

// initialize connection
io.on("connection", (socket) => {
  // console.log("A new user connected!!!");

  // listen to join events and let user join room
  socket.on("join", (arg, callback) => {
    try {
      addUser(socket.id, arg.name, arg.room);
      socket.join(arg.room);

      // broadcast to other users in the room
      socket.to(arg.room).emit("message broadcast", {
        name: "Admin",
        text: `${arg.name} has joined the room.`,
        time: new Date(),
        annoucement: true,
      });

      const usersInRoom = getUsersInRoom(arg.room);
      socket.to(arg.room).emit("room data", usersInRoom);

      callback({
        name: "Admin",
        text: `Welcome to the room, ${arg.name}!`,
        time: new Date(),
        usersInRoom,
      });
    } catch (err) {
      console.log(err.message);

      callback({ error: err.message });
      socket.disconnect();
    }
  });

  // listen to message events
  socket.on("message event", (arg) => {
    // console.log(arg);

    // broadcast to other users in the room
    const userData = getUserData(socket.id);
    if (userData) {
      socket.to(userData.room).emit("message broadcast", arg);
    }
  });

  // disconnection
  socket.on("disconnect", () => {
    const userData = getUserData(socket.id);
    removeUser(socket.id);
    // console.log("User has disconnected");

    // this is so when a user leaves a room, there's no error
    if (userData) {
      // broadcast to other users in the room
      socket.to(userData.room).emit("message broadcast", {
        name: "Admin",
        text: `${userData.name} has left the room.`,
        time: new Date(),
        annoucement: true,
      });

      const usersInRoom = getUsersInRoom(userData.room);
      socket.to(userData.room).emit("room data", usersInRoom);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server started at port ${PORT}...`);
});
