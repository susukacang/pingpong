// make connection

// const socket = io.connect('https://SpitefulAnnualAtoms.chrisyong.repl.co')

const socket = io.connect()

const message = document.getElementById('message')
const handle = document.getElementById('handle')
const btn = document.getElementById('send')
const ouput = document.getElementById('output')

const x = document.getElementById('x')
const y = document.getElementById('y')
const handle2 = document.getElementById('handle2')
const btnpiece = document.getElementById('btnpiece')
const piece = document.getElementById('piece')

const container = document.querySelector('.container')

const btnStopGame = document.getElementById('stopGame')
const btnStartGame = document.getElementById('startGame')

let playerId
let player
const playerList = []

btn.addEventListener('click', function() {
  socket.emit('chat', {
    message: message.value,
    handle: handle.value
  })
})

btnStopGame.addEventListener('click', function() {
  console.log('stop game')
  stopGame()
  socket.emit('stopGame', {
    message: message.value,
    handle: handle.value
  })
})

btnStartGame.addEventListener('click', function() {
  console.log('start game')
  startGame()
  socket.emit('startGame', {
    message: message.value,
    handle: handle.value
  })
})

// btnpiece.addEventListener('click', function() {
//   console.log('piece click')
//   socket.emit('sendCoord', {
//     x: x.value,
//     y: y.value,
//     handle: handle2.value
//   })
// })

// container.addEventListener('mousemove', function(e) {
//   console.log(e.x,e.y)
//   const rect = this.getBoundingClientRect()
//   console.log(rect)
//   socket.emit('sendCoord', {
//     x: e.x - rect.left,
//     y: e.y - rect.top,
//     handle: handle2.value
//   })
// })

// listen for addEventListener
socket.on('chat', function(data){
  output.innerHTML += '<p><strong>' + data.handle + ':</strong>' + data.message + '</p>'
})


const btnCreatePlayer = document.querySelector('.createPlayer')
btnCreatePlayer.addEventListener('click', function() {
  // playerId = getRandomIntInclusive(1,10)
    playerId = Math.random()

  // createPlayer(playerId)
  socket.emit('createPlayer', {
    playerId: playerId,
  })
})

const btnDeletePlayer = document.querySelector('.deletePlayer')
btnDeletePlayer.addEventListener('click', function() {
  // playerId = getRandomIntInclusive(1,10)
    deleteAllPlayers()

  // createPlayer(playerId)
  socket.emit('deletePlayer', {
    playerId: playerId,
  })
})


function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

function createPlayer(playerId){
  player = document.createElement('div')
  player.classList.add('player')

  player.setAttribute('id', playerId)
  player.innerHTML = playerId
  container.appendChild(player)

  playerList.push(player)
}
let players
function deleteAllPlayers(){
  players = document.querySelectorAll('.player')
  // players
  console.log(players)
  players.forEach((elem) => elem.remove())
}
container.addEventListener('mousemove', function(e) {
  // console.log(e.x,e.y)
  const rect = this.getBoundingClientRect()
  // console.log(rect)
  // console.log(e.x,e.y,playerId)
  socket.emit('sendCoord', {
    x: e.x - rect.left,
    y: e.y - rect.top,
    playerId: playerId
  })
})

socket.on('sendCoord', function(data){
  const piece = document.getElementById(data.playerId)
  if (piece !== null) {
    // console.log(data)
    piece.style.left = data.x + "px"
    // piece.style.left = 200 + "px"
    piece.style.top = data.y + "px"
  }
})

socket.on('createPlayer', function(data){
    createPlayer(data.playerId)
    // console.log('create player from emit socket')
})

socket.on('stopGame', function(){
  console.log('stop game')
})

socket.on('startGame', function(){
  console.log('start game')
})