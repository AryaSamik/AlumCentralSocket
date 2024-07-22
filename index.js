const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const dotenv = require('dotenv');
const app = express();
dotenv.config();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:3001", "https://alum-central-frontend.vercel.app"],
        methods: ["POST", "GET", "DELETE", "PATCH"],
    },
});

const userSocketMap = {};

const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
    console.log("a user connected", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId !== "undefined") {
        userSocketMap[userId] = socket.id;
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    console.log("Current online users:", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("user disconnected", socket.id);
        if (userId) {
            delete userSocketMap[userId];
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
            console.log("Current online users after disconnect:", Object.keys(userSocketMap));
        }
    });
});

const PORT = process.env.SOCKETPORT||8000;
console.log(PORT);
server.listen(PORT, () => {
    console.log(`Socket server listening on port ${PORT}`);
});

module.exports = {  io, getReceiverSocketId };

