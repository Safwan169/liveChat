const express = require('express');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const { MongoClient } = require('mongodb');  

// just for check

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const PORT = process.env.PORT || 4000;

// MongoDB connection string (replace with your MongoDB URL)
const uri = `mongodb+srv://${process.env.NEXT_PUBLIC_MONGOUSER}:${process.env.NEXT_PUBLIC_MONGOPASS}@cluster0.lel6e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const { ServerApiVersion, ObjectId } = require('mongodb');

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


const database =client.db("Quick_Bites")

const chatCollection = database.collection("massages")

let users = {};  // Store users with socket IDs

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // User joins with their name
    socket.on('join', async ({data}) => {
        users[socket.id] = data?.email;
        console.log(`${data.email} joined`);

        // Fetch and send all previous messages (user and admin) to the user
        const previousMessages = await chatCollection.find({ userEmail: users[socket.id]}).sort({ timestamp: 1 }).toArray();
        socket.emit('chat_history', previousMessages);  // Send chat history to the user
    });

    // Listen for messages from the user
    socket.on('user_message', async ({msg,name,image}) => {
        console.log(`Message from ${users[socket.id]}: ${msg}`,`${name}`);

        // Save the user's message in MongoDB
        const newMessage = {
            socketId: socket.id,
            userEmail: users[socket.id],
            userName: name,
            message: msg,
            timestamp: new Date(),
            image: image
        };
       const data= await chatCollection.insertOne(newMessage);  // Insert message into MongoDB
       console.log(data);
       

        // Emit the message to the admin or broadcast to others
        io.emit('admin_receive', { socketId: socket.id, userEmail: users[socket.id], msg ,userName:name,userImage:image});
    });

    // Admin sends a message to a specific user
    socket.on('admin_message', async ({ userId, message }) => {
        console.log(`Admin sends message to ${userId}: ${message}`);

        // Save the admin's message in MongoDB even if the user is disconnected
        const newMessage = {
            socketId: userId,   // user socketId get from admin
            userEmail: users[userId],
            message,
            timestamp: new Date(),
            role:'admin'  // Add admin role to the message in MongoDB
        };
        await chatCollection.insertOne(newMessage);  // Insert admin message into MongoDB

        // Check if the user is currently connected
        if (users[userId]) {
            io.to(userId).emit('message_from_admin', {message,role:'admin'});  // Send message to the user if they're online
        }
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        delete users[socket.id];  // Remove user from the list when they disconnect
    });
});

server.listen(PORT, () => {
    console.log('Server is running on port 4000');
});
