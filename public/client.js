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

const pw = 20;
const ph = 200;

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
	move = true;
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

function createPlayer(data) {
	const elem = document.createElement('div');
	elem.classList.add('player');

	elem.setAttribute('id', data);
	elem.innerHTML = data;
	container.appendChild(elem);

	players.push(data);

	// for selecting player
	elem.addEventListener('mousedown', function(e) {
		e.preventDefault()
		e.stopPropagation()
		move = !move
		console.log('mousedown', data)
		playerId = data
	})
}
// let players;

// need to fix the whoami
function deleteAllPlayers(data) {
	let elems = document.querySelectorAll('.player');
	console.log('delete length', elems.length, elems);
	for (const elem of elems) {
		elem.remove();
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

let move = true;
container.addEventListener('mousedown', function (e) {
	move = !move;
	console.log(move, e);
});

container.addEventListener('mousemove', function (e) {
	// console.log(e.x,e.y)
	const rect = this.getBoundingClientRect();
	// console.log(rect)
	// console.log(e.x,e.y,playerId)
	if (move)
		socket.emit('movePlayer', {
			playerId: playerId,
			x: e.x - rect.left - pw / 2,
			y: e.y - rect.top - ph / 2,
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

// simulate client vs server computation
let simulate = false;
let simBall;
let xSim = 450,
	ySim = 350;
let vSim = 10 / 6
let vxSim = vSim,
	vySim = vSim;

function performAnimation() {
	const whoami = document.querySelector('.whoami');

	let ids = '';
	players.forEach((id) => {
		ids += id + '<br>';
	});
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

	// test speed on client vs server
	if (simulate) moveSimBall();

	request = requestAnimationFrame(performAnimation);
}

socket.on('ticktock', function (data) {
	pos = data;
	// console.log('++a', pos.date, pos.ball.x, pos.ball.y)
});

simulation();

performAnimation();

function simulation() {
	if (simulate) {
		createSimBall();
	}
}
function moveSimBall() {
	const elem = document.querySelector('#simBall');
	// console.log(elem.getBoundingClientRect());
	xSim += vxSim;
	ySim += vySim;
	elem.style.left = xSim + 'px';
	elem.style.top = ySim + 'px';
	elem.innerHTML = Math.round(xSim) + ', ' + Math.round(ySim);
	checkCollision();
}

function createSimBall() {
	const elem = document.createElement('div');
	elem.classList.add('ball');

	elem.setAttribute('id', 'simBall');
	// elem.innerHTML = playerId;
	container.appendChild(elem);

	// console.log(elem.getBoundingClientRect());
	elem.style.left = xSim + 'px';
	elem.style.top = ySim + 'px';
}

function checkCollision() {
	// const boundary = document.querySelector('#boundary')
	// const wall = boundary.getBoundingClientRect()
	const rightWall = 900,
		leftWall = 100,
		topWall = 100,
		bottomWall = 700,
		br = 50;
	if (xSim + 2 * br > rightWall) {
		vxSim = -vxSim;
		xSim = rightWall - 2 * br;
	}
	if (xSim < leftWall) {
		vxSim = -vxSim;
		xSim = leftWall;
	}
	if (ySim + 2 * br > bottomWall) {
		vySim = -vySim;
		ySim = bottomWall - 2 * br;
	}
	if (ySim < topWall) {
		vySim = -vySim;
		ySim = topWall;
	}
}
