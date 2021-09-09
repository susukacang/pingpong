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

let v = 1,
	x = 500 - 50,
	vx = v,
	y = 400 - 50,
	vy = v,
	dt = 0, // currentUpdateTime -lastUpdateTime
	FPS = 10, // 10Hz or 100ms
	k = 1 / FPS, // k is time step constant to tweak the dt
	currentUpdateTime = new Date().getTime(),
	lastUpdateTime = new Date().getTime(),
	score_A = 0,
	score_B = 0;
let score = '0 | 0';
let seq = 0;

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

	let vmin = 0,
		vmax = 20,
		vxsign = 1,
		vysign = 1;
	socket.on('changeBallSpeed', function (data) {
		// v is always positive

		if (vx != 0) vxsign = Math.sign(vx);
		if (vy != 0) vysign = Math.sign(vy);
		// increase speed
		if (data.v == 1) {
			console.log('increase speed');
			if (v < vmax) {
				v = v + 1;
			}
		}
		// decrease speed
		if (data.v == -1) {
			console.log('decrease speed');
			if (v > vmin) {
				v = v - 1;
			}
		}
		vx = vxsign * v;
		vy = vysign * v;
		console.log('change speed', v);
	});

	// game logic

	// let v = 1,
	// 	x = 500 - 50,
	// 	vx = v,
	// 	y = 400 - 50,
	// 	vy = v,
	// 	dt = 0, // currentUpdateTime -lastUpdateTime
	// 	FPS = 10, // 10Hz or 100ms
	// 	k = 1 / FPS, // k is time step constant to tweak the dt
	// 	currentUpdateTime = new Date().getTime(),
	// 	lastUpdateTime = new Date().getTime(),
	// 	score_A = 0,
	// 	score_B = 0;
	// let score = '0 | 0';
	// let seq = 0;

	const updateScore = (score_A, score_B) => {
		score = score_A + ' | ' + score_B;
	};

	const ticktock = (dt) => {
		// console.log('v',v)
		// const vx = vvx * dt
		// const vy = vvy * dt
		const data = {
			seq: seq,
			date: currentUpdateTime,
			ball: {
				x: x,
				vx: vx,
				y: y,
				vy: vy,
				v: v,
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
			const xc = x + br;
			const yc = y + br;
			const xl = xc - br;
			const xr = xc + br;
			const yt = yc - br;
			const yb = yc + br;
			const pxc = px + pw / 2;
			const pyc = py + ph / 2;
			const pxl = pxc - pw / 2;
			const pxr = pxc + pw / 2;
			const pyt = pyc - ph / 2;
			const pyb = pyc + ph / 2;
			if (yc > pyt - br && yc < pyb + br) {
				// console.log('hit', yb, pyt, yt, pyb, new Date().getTime());
				if (Math.abs(xc - pxl) < Math.abs(xc - pxr)) {
					// console.log('ball on left side of player');
					if (Math.abs(xc - pxl) < br) {
						if (vx > 0) {
							vx = -vx;
							x = pxl - 2 * br;
						} else if (vx < 0) {
							console.log('push left');
							x = pxl - 2 * br - 3 * pw;
						}
					}
				}
				if (Math.abs(xc - pxl) > Math.abs(xc - pxr)) {
					// console.log('ball on right side of player');
					if (Math.abs(xc - pxr) < br) {
						if (vx < 0) {
							vx = -vx;
							x = pxr;
						} else if (vx > 0) {
							console.log('push right');
							x = pxr + 3 * pw;
						}
					}
				}
			}
			if (xc > pxl - br && xc < pxr + br) {
				// console.log('hit', yb, pyt, yt, pyb, new Date().getTime());
				if (Math.abs(yc - pyt) < Math.abs(yc - pyb)) {
					// console.log('ball on left side of player');
					if (Math.abs(yc - pyt) < br) {
						if (vy > 0) {
							vy = -vy;
							y = pyt - 2 * br;
						} else if (vy < 0) {
							console.log('push left');
							y = pyt - 2 * br - 3 * pw;
						}
					}
				}
				if (Math.abs(yc - pyt) > Math.abs(yc - pyb)) {
					// console.log('ball on right side of player');
					if (Math.abs(yc - pyb) < br) {
						if (vy < 0) {
							vy = -vy;
							y = pyb;
						} else if (vy > 0) {
							console.log('push right');
							y = pyb + 3 * pw;
						}
					}
				}
			}
			if (0) {
				if (y + 2 * br > py && y < py + ph) {
					if (vx < 0) {
						if (x < px + pw && x > px) {
							x = px + pw;
							vx = -vx;
							console.log('hit1');
						} else if (x + 2 * br - pw / 2 > px && x + 0 * br < px + pw) {
							console.log(
								'hit1a',
								x,
								px,
								x + 2 * br,
								px + pw,
								x + 2 * br > px,
								x + 2 * br < px + pw,
								x + 2 * br > px && x + 2 * br < px + pw
							);
							x = px - 2 * br - 3 * pw;
							console.log(
								'hit1a',
								x,
								px,
								x + 2 * br,
								px + pw,
								x + 2 * br > px,
								x + 2 * br < px + pw,
								x + 2 * br > px && x + 2 * br < px + pw
							);
						}
					}
					if (vx > 0) {
						if (x + 2 * br > px && x + 2 * br < px + pw) {
							x = px - 2 * br;
							vx = -vx;
							console.log('hit2');
						} else if (x < px + pw && x > px) {
							console.log(
								'hit2a',
								x,
								px,
								x + 2 * br,
								px + pw,
								x < px + pw,
								x > px,
								x < px + pw && x > px
							);
							x = px + pw + 3 * pw;
							console.log(
								'hit2a',
								x,
								px,
								x + 2 * br,
								px + pw,
								x < px + pw,
								x > px,
								x < px + pw && x > px
							);
						}
					}
				}
				if (x < px && x + 2 * br > px + pw) {
					if (vy > 0) {
						if (Math.hypot(y + 2 * br - py) < 2.5 * dt_k) {
							y = py - 2 * br;
							vy = -vy;
							console.log('hit3');
						}
					}
					if (vy < 0) {
						if (Math.hypot(y - py - ph) < 2.5 * dt_k) {
							y = py + ph;
							vy = -vy;
							console.log('hit4');
						}
					}
				}
			}
		});
	};

	// let s
	let i = 0;
	interval = setInterval(function () {
		currentUpdateTime = new Date().getTime();
		const dt = currentUpdateTime - lastUpdateTime;
		++seq;
		// if (seq < 512) {
		ticktock(dt);
		// console.log(++i, dt);
		// }
		lastUpdateTime = currentUpdateTime;
	}, 1000 / FPS);
});
