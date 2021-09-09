// make connection

// const socket = io.connect('https://SpitefulAnnualAtoms.chrisyong.repl.co')

const socket = io.connect();

// const x = document.getElementById('x');
// const y = document.getElementById('y');
// const handle2 = document.getElementById('handle2');
// const btnpiece = document.getElementById('btnpiece');

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
	// stopGame();
	socket.emit('stopGame', {});
});

btnStartGame.addEventListener('click', function () {
	console.log('start game');
	// startGame();
	socket.emit('startGame', {});
});

let game = false;
const btnGame = document.getElementById('game');
btnGame.addEventListener('click', function () {
	if (game) {
		console.log('start game');
		// startGame();
		socket.emit('startGame', {});
		this.innerHTML = 'Stop Game';
		this.style.background = '#df4c33';
		game = false
	} else {
		console.log('stop game');
		// stopGame();
		socket.emit('stopGame', {});
		this.innerHTML = 'Start Game';
		this.style.background = '#575ed8';
		game = true
	}
});

function stopGame() {
	console.log('stopGame', request)
	if (request) cancelAnimationFrame(request);
}

function startGame() {
	requestAnimationFrame(performAnimation);
}

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

const btnSimulate = document.getElementById('simulate');
btnSimulate.addEventListener('click', function () {
	// socket.emit('deleteAllPlayers', {});
	simulate = !simulate;
	if (simulate) {
		this.style.background = '#8f2b7e';
		this.innerHTML = 'Stop simulation';
		simulation();
	} else {
		this.style.background = '#2b8f30';
		const simBall = document.querySelector('#simBall');
		simBall.parentNode.removeChild(simBall);
		this.innerHTML = 'Start simulation';
	}
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
	elem.addEventListener('mousedown', function (e) {
		e.preventDefault();
		e.stopPropagation();
		move = !move;
		console.log('mousedown', data);
		playerId = data;
		highlightPlayer(playerId)
	});
}

function highlightPlayer(playerId) {
	const elem = document.getElementById(playerId);
	elem.classList.toggle("highlight")
}

// let players;

// need to fix the whoami
function deleteAllPlayers(data) {
	let elems = document.querySelectorAll('.player');
	console.log('delete length', elems.length, elems);
	for (const elem of elems) {
		// elem.remove();
		elem.parentNode.removeChild(elem);
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
	stopGame()
	console.log('stop game???!!!***');
});

socket.on('startGame', function () {
	startGame()
	console.log('start game');
});

const moveBall = (x, y) => {
	// const ball = document.querySelector('.ball');
	ball.style.left = Math.round(x) + 'px';
	ball.style.top = Math.round(y) + 'px';
	ball.innerHTML = Math.round(x) + ', ' + Math.round(y);
};

let request;
let pos = {};
let currentTimeClient = new Date().getTime();
let lastTime = new Date().getTime();
let lastTimeClient = lastTime;
let deltaTime = 0;
let deltaTimeClient = 0;

// simulate client vs server computation
let simulate = false;
let simBall;
let xSim = 450,
	ySim = 350;
let vSim = 10 / 6;
let vxSim = vSim,
	vySim = vSim;

let i = 0
const clientData = {
	date: new Date().getTime(),
	ball: {
		x: x0,
		vx: 1,
		y: y0,
		vy: 1,
	},
	dt: 0,
	players: [],
	score: 'score',
};

let lastClientData = {
	date: new Date().getTime(),
	ball: {
		x: x0,
		vx: 1,
		y: y0,
		vy: 1,
	},
	dt: 0,
	players: [],
	score: 'score',
};

let lastPos = {
	date: new Date().getTime(),
	ball: {
		x: x0,
		vx: 1,
		y: y0,
		vy: 1,
	},
	dt: 0,
	players: [],
	score: 'score',
};

// let ballx = x0, bally = y0, ballvx = 1, ballvy = 1

function performAnimation() {
	const whoami = document.querySelector('.whoami');

	let ids = '';
	players.forEach((id) => {
		ids += id + '<br>';
	});
	// console.log(ids)
	whoami.innerHTML = '<div>' + ids + '</div>';

	if (pos.ball !== undefined) {
		// client prediction
		if(deltaTime === 0) {
			clientData.ball.x += clientData.ball.vx * 10/6 // 100Hz/60Hz * dt_k where dt_k = 10 in server
			clientData.ball.y += clientData.ball.vy * 10/6
			checkWallCollision()
			moveBall(clientData.ball.x, clientData.ball.y)
		} else { // server update
			console.log('server update')
			clientData.ball.x = pos.ball.x
			clientData.ball.y = pos.ball.y
			clientData.ball.vx = pos.ball.vx
			clientData.ball.vy = pos.ball.vy
			clientData.ball.x += clientData.ball.vx * 10/6
			clientData.ball.y += clientData.ball.vy * 10/6
			// moveBall(pos.ball.x, pos.ball.y);
			moveBall(clientData.ball.x, clientData.ball.y)

		}
		// moveBall(pos.ball.x, pos.ball.y);
		deltaTime = pos.date - lastTime;
		currentTimeClient = (new Date()).getTime()
		deltaTimeClient = currentTimeClient - lastTimeClient
		// console.log(++i, pos.ball.vx, pos.ball.vy, pos.date, lastTime, deltaTime, currentTimeClient, lastTimeClient, deltaTimeClient)
		// console.log('--b', pos.date, pos.ball.x, pos.ball.y)
		if (deltaTime < 0) console.log('danger!');
		lastTime = pos.date;
		lastTimeClient = currentTimeClient;

		const dXc = clientData.ball.x - lastClientData.ball.x
		const dYc = clientData.ball.y - lastClientData.ball.y
		const dTc = clientData.date - lastClientData.date

		lastClientData = clientData

		const dX = pos.ball.x - lastPos.ball.x
		const dY = pos.ball.y - lastPos.ball.y
		const dT = pos.date - lastPos.date

		console.log('dX/dT = ', dX/dT, 'dY/dT = ', dY/dT, 'dX = ', dX, 'dY = ', dY, 'dT = ', dT)
		console.log('dXc/dTc = ', dXc/dTc, 'dYc/dTc = ', dYc/dTc, 'dXc = ', dXc, 'dYc = ', dYc, 'dTc = ', dTc)

		lastPos = pos
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

// simulation();

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

function checkWallCollision() {
	// const boundary = document.querySelector('#boundary')
	// const wall = boundary.getBoundingClientRect()
	const rightWall = 900,
		leftWall = 100,
		topWall = 100,
		bottomWall = 700,
		br = 50;
	if (clientData.ball.x + 2 * br > rightWall) {
		clientData.ball.vx = -clientData.ball.vx;
		clientData.ball.x = rightWall - 2 * br;
	}
	if (clientData.ball.x < leftWall) {
		clientData.ball.vx = -clientData.ball.vx;
		clientData.ball.x = leftWall;
	}
	if (clientData.ball.y + 2 * br > bottomWall) {
		clientData.ball.vy = -clientData.ball.vy;
		clientData.ball.y = bottomWall - 2 * br;
	}
	if (clientData.ball.y < topWall) {
		clientData.ball.vy = -clientData.ball.vy;
		clientData.ball.y = topWall;
	}
}