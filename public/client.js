// make connection

// const socket = io.connect('https://SpitefulAnnualAtoms.chrisyong.repl.co')

const socket = io.connect();

const x = document.getElementById('x');
const y = document.getElementById('y');
const handle2 = document.getElementById('handle2');
const btnpiece = document.getElementById('btnpiece');

// const piece = document.getElementById('piece');
const ball = document.querySelector('.ball');

const container = document.querySelector('.container');

const btnStopGame = document.getElementById('stopGame');
const btnStartGame = document.getElementById('startGame');

const score = document.getElementById('score');

let playerId;
let player;
const players = [];
const x0 = 200;
const y0 = 400;

btnStopGame.addEventListener('click', function () {
	console.log('stop game');
	stopGame();
	socket.emit('stopGame', {
		message: message.value,
		handle: handle.value,
	});
});

btnStartGame.addEventListener('click', function () {
	console.log('start game');
	startGame();
	socket.emit('startGame', {
		message: message.value,
		handle: handle.value,
	});
});

const btnCreatePlayer = document.querySelector('.createPlayer');
btnCreatePlayer.addEventListener('mousedown', function () {
	// playerId = getRandomIntInclusive(1,10)
	playerId = Math.random();
	console.log('btn click create player');
	// createPlayer(playerId)
	socket.emit('createPlayer', {
		playerId: playerId,
		x: x0,
		y: y0,
	});
});

const btnDeletePlayer = document.querySelector('.deletePlayer');
btnDeletePlayer.addEventListener('click', function () {
	socket.emit('deletePlayer', {
		playerId: playerId,
		// x: x0,
		// y: y0
	});
});

const btnDeleteAllPlayers = document.querySelector('.deleteAllPlayers');
btnDeleteAllPlayers.addEventListener('click', function () {
	socket.emit('deleteAllPlayers', {});
});

function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

function createPlayer(playerId) {
	const elem = document.createElement('div');
	elem.classList.add('player');

	elem.setAttribute('id', playerId);
	elem.innerHTML = playerId;
	container.appendChild(elem);

	players.push(playerId);
}
// let players;

// need to fix the whoami
function deleteAllPlayers(data) {
	let elems = document.querySelectorAll('.player')
	console.log('delete length', elems.length, elems)
	for (const elem of elems) {
		elem.remove()
		players.pop();
	}
}

function deletePlayer(playerId) {
	console.log('delete player' + playerId);
	const elem = document.getElementById(playerId);
	if (elem) {
		elem.parentNode.removeChild(elem);
		console.log('remove?');
	}
	players.pop();
}

container.addEventListener('mousemove', function (e) {
	// console.log(e.x,e.y)
	const rect = this.getBoundingClientRect();
	// console.log(rect)
	// console.log(e.x,e.y,playerId)
	socket.emit('movePlayer', {
		playerId: playerId,
		x: e.x - rect.left,
		y: e.y - rect.top,
	});
});

socket.on('movePlayer', function (data) {
	const player = document.getElementById(data.playerId);
	if (player !== null) {
		if (data.x) {
			// console.log(data)
			// player.style.left = data.x + 'px';
			player.style.left = data.x + 'px';
			player.style.top = data.y + 'px';
			player.innerHTML = '<p>' + playerId + '</p>' + data.x + ',' + data.y;
		}
	}
});

socket.on('createPlayer', function (data) {
	createPlayer(data);
	console.log('create player from emit socket', data);
});

socket.on('deletePlayer', function (data) {
	deletePlayer(data);
	console.log('delete player from emit socket', data);
});

socket.on('deleteAllPlayers', function (data) {
	deleteAllPlayers(data);
	console.log('delete all players from emit socket');
});

socket.on('stopGame', function () {
	console.log('stop game???!!!***');
});

socket.on('startGame', function () {
	console.log('start game');
});

const moveBall = (x, y) => {
	// const ball = document.querySelector('.ball');
	ball.style.left = x + 'px';
	ball.style.top = y + 'px';
	ball.innerHTML = x + ', ' + y;
};

let request;
let pos = {};
let lastTime = new Date().getTime();
let deltaTime = 0;

function performAnimation() {
	const whoami = document.querySelector('.whoami');

	let ids = ''
	players.forEach((id) => {
		ids += id + '<br>'
	})
	// console.log(ids)
	whoami.innerHTML = '<div>' + ids + '</div>';

	if (pos.ball !== undefined) {
		moveBall(pos.ball.x, pos.ball.y);
		deltaTime = pos.date - lastTime;
		// console.log('--b', pos.date, pos.ball.x, pos.ball.y)
		if (deltaTime < 0) console.log('danger!');
		lastTime = pos.date;
	}

	score.innerHTML = 'Score : ' + pos.score;

	request = requestAnimationFrame(performAnimation);
}

socket.on('ticktock', function (data) {
	pos = data;
	// console.log('++a', pos.date, pos.ball.x, pos.ball.y)
});

performAnimation();
