const express = require('express')
const socket = require('socket.io')

const app = express();
const server = app.listen(3000, () => {
  console.log('server started');
});

// static files
app.use(express.static('public'))

// socket setup
const io = socket(server)

io.on('connection', function(socket) {
  console.log('made socket connection', socket.id)

  socket.on('chat', function(data){
    io.sockets.emit('chat', data)
  })
})

// io.on('connection', function(socket) {
//   console.log('made socket connection', socket.id)

//   socket.on('sendCoord', function(data){
//     io.sockets.emit('sendCoord', data)
//   })
// })

io.on('connection', function(socket) {
  console.log('made socket connection', socket.id)

  socket.on('sendCoord', function(data){
    io.sockets.emit('sendCoord', data)
  })

  socket.on('createPlayer', function(data){
    io.sockets.emit('createPlayer', data)
  })

  socket.on('stopGame', function(data){
    io.sockets.emit('stopGame', data)
  })

  socket.on('startGame', function(data){
    io.sockets.emit('startGame', data)
  })
})