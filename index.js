const express = require('express');

const app = express();

const server = require('http').createServer(app);

const io = require('socket.io')(server, {
    cors: { origin: "*" }
});

let users = [];

app.get('/test',(req, res) => {
    res.send('This is testing');
});

io.on('connection', (socket) => {
    console.log('Someone is connect');

    socket.on('joinRoom', ({ roomId, name, profile }) => {
        socket.join(roomId);

        users.push({
            id: socket.id,
            name,
            profile,
            roomId
        });

        socket.on('message', (data) => {
            io.sockets.to(roomId).emit('message', data);
        });

        socket.on('image', (data) => {
            io.sockets.to(roomId).emit('image', data);
        });

        socket.broadcast.to(roomId).emit('joining', name);
    });


    socket.on('disconnect', () => {
       const index = users.findIndex(e => e.id === socket.id);
        if (index !== -1) {
            const user = users[index];
            users.splice(index, 1);
            io.sockets.to(user.roomId).emit('leaving', user.name);
        } else {
            console.log('not in room');
        }
    })

});

const port = process.env.PORT || 3000;
server.listen(port,() => console.log(`Listening on port ${port}`));