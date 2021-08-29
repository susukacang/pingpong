const express = require('express');
const socket = require('socket.io');

const app = express();
const server = app.listen(3001, () => {
	console.log('server started');
});

// static files
app.use(express.static('public'));

// socket setup
const io = socket(server);

let interval; //setInterval

let players = [];

// io.on('connection', function (socket) {
// 	console.log('made socket connection', socket.id);

// 	socket.on('chat', function (data) {
// 		io.sockets.emit('chat', data);
// 	});
// });

// io.on('connection', function(socket) {
//   console.log('made socket connection', socket.id)

//   socket.on('movePlayer', function(data){
//     io.sockets.emit('movePlayer', data)
//   })
// })

io.on('connection', function (socket) {
	console.log(
		'made socket connection',
		socket.id,
		'%s sockets connected',
		io.engine.clientsCount
	);
	if (interval) clearInterval(interval);

	console.log('%s sockets connected', io.engine.clientsCount);
	socket.on('disconnect', function () {
		console.log('disconnect:', socket.id);
		clearInterval(interval);
		console.log('%s sockets connected', io.engine.clientsCount);
	});

	socket.on('movePlayer', function (data) {
		io.sockets.emit('movePlayer', data);
		// console.log((new Date()).getTime())
		// player[data.playerId] <- x,y
		// players.push(data)
		// const player = data
		const id = players.findIndex((p) => p.playerId == data.playerId);

		if (id > -1) {
			players[id].x = data.x;
			players[id].y = data.y;
			// console.log('id', id, players[id]);
		}
	});

	// let players = [];

	socket.on('createPlayer', function (data) {
		console.log('emit create player', data.playerId);
		players.push(data);
		io.sockets.emit('createPlayer', data.playerId);
		if (players) console.log(players.length, players);
	});

	socket.on('deletePlayer', function (data) {
		console.log('emit delete player');
		const id = players.findIndex((p) => {
			p.playerId === data.playerId;
		});
		console.log('removed', id);
		players.splice(id, 1);
		console.log('remaining', players);
		if (players) console.log(players.length);
		io.sockets.emit('deletePlayer', data.playerId);
	});

	socket.on('deleteAllPlayers', function (data) {
		console.log('emit delete all players', players);
		players = [];
		io.sockets.emit('deleteAllPlayers', players);
	});

	socket.on('stopGame', function (data) {
		io.sockets.emit('stopGame', data);
	});

	socket.on('startGame', function (data) {
		io.sockets.emit('startGame', data);
	});

	// game logic

	let v = 1,
		x = 500 - 50,
		vx = v,
		y = 400 - 50,
		vy = v,
		dt = 0, // currentTime -lastUpdateTime
		FPS = 10, // 10Hz or 100ms
		k = 1 / FPS, // k is time step constant to tweak the dt
		lastUpdateTime = new Date().getTime(),
		score_A = 0,
		score_B = 0;
	let score = '0 | 0';

	const updateScore = (score_A, score_B) => {
		score = score_A + ' | ' + score_B;
	};

	const ticktock = (dt) => {
		// const vx = vvx * dt
		// const vy = vvy * dt
		const data = {
			date: new Date().getTime(),
			ball: {
				x: x,
				vx: vx,
				y: y,
				vy: vy,
			},
			dt: dt,
			players: players,
			score: score,
		};
		io.sockets.emit('ticktock', data);
		let dt_k = Math.round(dt * k);
		// dt_k = 10;
		x += vx * dt_k;
		y += vy * dt_k;
		// console.log(vx * dt_k)
		// boundaries
		const xa = 100,
			xb = 800,
			ya = 100,
			yb = 600;
		if (x > xb) {
			x = xb;
			vx = -vx;
			updateScore(++score_A, score_B);
		}
		if (x < xa) {
			x = xa;
			vx = -vx;
			updateScore(score_A, ++score_B);
		}
		if (y > yb) {
			y = yb;
			vy = -vy;
		}
		if (y < ya) {
			y = ya;
			vy = -vy;
		}

		// output data information
		// console.log(data); // log output

		// collision with players
		players.forEach((p) => {
			// paddle dimensions
			const pw = 20,
				ph = 200;
			// px = 200;
			let py = p.y,
				px = p.x;
			// don't use p.x
			// ball dimensions
			const br = 50;
			console.log(y + br > py && y - br < py + ph)
			if (y + br > py && y - br < py + ph) {
				if (vx < 0) {
					if (x < px + pw && x > px) {
						x = px + pw;
						vx = -vx;
					}
				}
				if (vx > 0) {
					if (x + 2 * br > px && x + 2 * br < px + pw) {
						x = px - 2 * br;
						vx = -vx;
					}
				}
			}
			if (x < px && x + 2 * br > px + pw) {
				if (vy > 0) {
					if (Math.hypot(y + 2 * br - py) < 2.5 * dt_k) {
						y = py - 2 * br;
						vy = -vy;
					}
				}
				if (vy < 0) {
					if (Math.hypot(y - py - ph) < 2.5 * dt_k) {
						y = py + ph;
						vy = -vy;
					}
				}
			}
		});
	};

	// let s
	let i = 0;
	interval = setInterval(function () {
		const currentTime = new Date().getTime();
		const dt = currentTime - lastUpdateTime;
		ticktock(dt);
		// console.log(i++)
		lastUpdateTime = currentTime;
	}, 1000 / FPS);
});
