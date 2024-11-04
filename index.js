const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Store connected users in a dictionary with their socket ID
const users = {};

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // When a user joins, associate their ID (or username) with their socket ID
    socket.on("join", (userId) => {
        users[userId] = socket.id; // Store the user's socket ID
        console.log(`User ${userId} joined with socket ID: ${socket.id}`);
    });

    // Handle sending a private message
    socket.on("send_private_message", ({ recipientId, message }) => {
        const recipientSocketId = users[recipientId];
        if (recipientSocketId) {
            io.to(recipientSocketId).emit("receive_private_message", {
                senderId: socket.id,
                message,
            });
        }
    });

    // Handle user disconnecting
    // socket.on("disconnect", () => {
    //     console.log("User disconnected:", socket.id);
    //     // Remove the disconnected user's socket ID from the users list
    //     for (const [userId, id] of Object.entries(users)) {
    //         if (id === socket.id) {
    //             delete users[userId];
    //             break;
    //         }
    //     }
    // });
});

server.listen(3001, () => {
    console.log("Socket.IO server running on port 3001");
});
