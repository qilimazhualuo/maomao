import { io, Server } from 'socket.io'
import express from 'express'

const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('stream', (data) => {
        // 这里可以处理从客户端接收到的流数据
        console.log('Received stream data:', data);
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});