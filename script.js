const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const width = canvas.width;
const height = canvas.height;

// 1 = wall, 0 = empty, 'p' = player
const map = [
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,2,2,2,2,2,0,0,0,0,3,0,3,0,3,0,0,0,1],
	[1,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,2,0,0,0,2,0,0,0,0,3,0,0,0,3,0,0,0,1],
	[1,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,2,2,0,2,2,0,0,0,0,3,0,3,0,3,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,4,0,4,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,4,0,0,0,0,5,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,4,0,4,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,4,0,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// keys
class keyPress {
	up = false;
	down = false;
	left = false;
	right = false;
	arrowLeft = false;
	arrowRight = false;


	constructor() {
		this.init();
	}

	keydown(e) {
		switch (e.key){
			case 'w':
				key.up = true;
				break;
			case 's':
				key.down = true;
				break;
			case 'a':
				key.left = true;
				break;
			case 'd':
				key.right = true;
				break;
			case 'ArrowLeft':
				key.arrowLeft = true;
				break;
			case 'ArrowRight':
				key.arrowRight = true;
				break;
		}
	}

	keyup(e) {
		switch (e.key){
			case 'w':
				key.up = false;
				break;
			case 's':
				key.down = false;
				break;
			case 'a':
				key.left = false;
				break;
			case 'd':
				key.right = false;
				break;
			case 'ArrowLeft':
				key.arrowLeft = false;
				break;
			case 'ArrowRight':
				key.arrowRight = false;
				break;
		}
	}

    init () {
        document.addEventListener('keydown', this.keydown);
        document.addEventListener('keyup', this.keyup);
    }
}

const key = new keyPress();

// create 3D game world from 2D map array and draw it to canvas context usind raycasting
// arowLeft and arrowRight are used to rotate the player
// up and down are used to move the player forward and backward
const mapScale = 200 / map.length;



class player {
	constructor(map, x, y) {
		this.map = map;

		// player position
		this.posX = x;
		this.posY = y;

		// player direction
		this.dirX = -1;
		this.dirY = 0;

		// camera plane
		this.planeX = 0;
		this.planeY = 0.66;

		// time
		this.time = 0;
		this.oldTime = 0;

		// movement speed
		this.speed = 0.1;

		// rotation speed
		this.rotSpeed = 0.05;

		// field of view
		this.fov = 60;

	}

	update() {
		this.move();
		this.handleCamera();
	}

	handleCamera() {
		let oldDirX = this.dirX;
		let oldPlaneX = this.planeX;

		if (key.arrowLeft) {
			this.dirX = this.dirX * Math.cos(this.rotSpeed) - this.dirY * Math.sin(this.rotSpeed);
			this.dirY = oldDirX * Math.sin(this.rotSpeed) + this.dirY * Math.cos(this.rotSpeed);
			this.planeX = this.planeX * Math.cos(this.rotSpeed) - this.planeY * Math.sin(this.rotSpeed);
			this.planeY = oldPlaneX * Math.sin(this.rotSpeed) + this.planeY * Math.cos(this.rotSpeed);
		}
		if (key.arrowRight) {
			this.dirX = this.dirX * Math.cos(-this.rotSpeed) - this.dirY * Math.sin(-this.rotSpeed);
			this.dirY = oldDirX * Math.sin(-this.rotSpeed) + this.dirY * Math.cos(-this.rotSpeed);
			this.planeX = this.planeX * Math.cos(-this.rotSpeed) - this.planeY * Math.sin(-this.rotSpeed);
			this.planeY = oldPlaneX * Math.sin(-this.rotSpeed) + this.planeY * Math.cos(-this.rotSpeed);
		}		
	}
	
	

	move() {
		if (key.up) {
			if (this.map[Math.floor(this.posY + this.dirY * this.speed)][Math.floor(this.posX)] === 0) {
				this.posY += this.dirY * this.speed;
			}
			if (this.map[Math.floor(this.posY)][Math.floor(this.posX + this.dirX * this.speed)] === 0) {
				this.posX += this.dirX * this.speed;
			}
		}
		if (key.down) {
			if (this.map[Math.floor(this.posY - this.dirY * this.speed)][Math.floor(this.posX)] === 0) {
				this.posY -= this.dirY * this.speed;
			}
			if (this.map[Math.floor(this.posY)][Math.floor(this.posX - this.dirX * this.speed)] === 0) {
				this.posX -= this.dirX * this.speed;
			}
		}
		if (key.left) {
			if (this.map[Math.floor(this.posY)][Math.floor(this.posX - this.dirY * this.speed)] === 0) {
				this.posX -= this.dirY * this.speed;
			}
			if (this.map[Math.floor(this.posY + this.dirX * this.speed)][Math.floor(this.posX)] === 0) {
				this.posY += this.dirX * this.speed;
			}
		}
		if (key.right) {
			if (this.map[Math.floor(this.posY)][Math.floor(this.posX + this.dirY * this.speed)] === 0) {
				this.posX += this.dirY * this.speed;
			}
			if (this.map[Math.floor(this.posY - this.dirX * this.speed)][Math.floor(this.posX)] === 0) {
				this.posY -= this.dirX * this.speed;
			}
		}
	}
}

class World {
	constructor(map, screenWidth, screenHeight, player) {
		this.map = map;
		this.screenWidth = screenWidth;
		this.screenHeight = screenHeight;
		this.cameraX = 0;
		this.player = player;
		this.rayDirX = 0;
		this.rayDirY = 0;
		this.mapX = 0;
		this.mapY = 0;
		this.deltaDistX = 0;
		this.deltaDistY = 0;
		this.sideDistX = 0;
		this.sideDistY = 0;
		this.stepX = 0;
		this.stepY = 0;
		this.hit = 0;
		this.side = 0;
		this.lineHeight = 0;
		this.drawStart = 0;
		this.drawEnd = 0;
		this.wallX = 0;
		this.lineHeight = 0;
		this.drawStart = 0;
		this.drawEnd = 0;
		
	}

	init_vars(x) {
		this.cameraX = 2 * x / this.screenWidth - 1;
		this.rayDirX = this.player.dirX + this.player.planeX * this.cameraX;
		this.rayDirY = this.player.dirY + this.player.planeY * this.cameraX;

		this.mapX = Math.floor(this.player.posX);
		this.mapY = Math.floor(this.player.posY);

		this.deltaDistX = Math.abs(1 / this.rayDirX);
		this.deltaDistY = Math.abs(1 / this.rayDirY);
		
		this.hit = 0;
	}

	init_dda() {
		if (this.rayDirX < 0) {
			this.stepX = -1;
			this.sideDistX = (this.player.posX - this.mapX) * this.deltaDistX;
		} else {
			this.stepX = 1;
			this.sideDistX = (this.mapX + 1.0 - this.player.posX) * this.deltaDistX;
		}
		if (this.rayDirY < 0) {
			this.stepY = -1;
			this.sideDistY = (this.player.posY - this.mapY) * this.deltaDistY;
		} else {
			this.stepY = 1;
			this.sideDistY = (this.mapY + 1.0 - this.player.posY) * this.deltaDistY;
		}
	}

	perform_dda() {
		while (this.hit === 0) {
			if (this.sideDistX < this.sideDistY) {
				this.sideDistX += this.deltaDistX;
				this.mapX += this.stepX;
				this.side = 0;
			} else {
				this.sideDistY += this.deltaDistY;
				this.mapY += this.stepY;
				this.side = 1;
			}
			if (this.map[this.mapY][this.mapX] > 0) {
				this.hit = 1;
			}
		}
	}

	calcPerpWallDist() {
		if (this.side === 0) {
			this.perpWallDist = (this.mapX - this.player.posX + (1 - this.stepX) / 2) / this.rayDirX;
		} else {
			this.perpWallDist = (this.mapY - this.player.posY + (1 - this.stepY) / 2) / this.rayDirY;
		}
	}

	calcLineHeight() {
		this.lineHeight = Math.floor(this.screenHeight / this.perpWallDist);
	}

	getStartEnd() {
		this.drawStart = -this.lineHeight / 2 + this.screenHeight / 2;
		if (this.drawStart < 0) {
			this.drawStart = 0;
		}
		this.drawEnd = this.lineHeight / 2 + this.screenHeight / 2;
		if (this.drawEnd >= this.screenHeight) {
			this.drawEnd = this.screenHeight - 1;
		}
	}

	draw(x) {
		// draw ceiling
		ctx.fillStyle = 'rgb(0, 0, 255, 0.5)';
		ctx.fillRect(x, 0, 1, this.drawStart);
		// draw floor
		ctx.fillStyle = 'rgb(0, 255, 0, 0.5)';
		ctx.fillRect(x, this.drawEnd, 1, this.screenHeight - this.drawEnd);
		// draw walls
		if (this.side === 0) {
			ctx.fillStyle = 'rgb(255, 0, 0)';
		} else {
			ctx.fillStyle = 'rgb(255, 255, 0)';
		}
		ctx.fillRect(x, this.drawStart, 1, this.drawEnd - this.drawStart);
	}

	update () {
		for (let x = 0; x < this.screenWidth; x++) {
			this.init_vars(x);
			this.init_dda();
			this.perform_dda();
			this.calcPerpWallDist();
			this.calcLineHeight();
			this.getStartEnd();
			this.draw(x);
		}
	}
}


const p = new player(map, 20, 10);
const w = new World(map, width, height, p);

const drawMiniMap = () => {
	let mapWidth = 200;
	let mapHeight = 200;
	let mapX = width - mapWidth - 10;
	let mapY = 10;
	let squareSize = mapWidth / map[0].length;
	ctx.fillStyle = 'rgb(0, 0, 0)';
	ctx.fillRect(mapX, mapY, mapWidth, mapHeight);
	for (let i = 0; i < map.length; i++) {
		for (let j = 0; j < map[i].length; j++) {
			if (map[i][j] > 0) {
				ctx.fillStyle = 'rgb(255, 255, 255)';
				ctx.fillRect(mapX + j * squareSize, mapY + i * squareSize, squareSize, squareSize);
			}
		}
	}
	ctx.fillStyle = 'rgb(255, 0, 0)';
	ctx.fillRect(mapX + p.posX * squareSize, mapY + p.posY * squareSize, squareSize, squareSize);
	ctx.fillStyle = 'rgb(0, 0, 255)';
	ctx.fillRect(mapX + p.posX * squareSize + p.dirX * squareSize / 2, mapY + p.posY * squareSize + p.dirY * squareSize / 2, squareSize / 2, squareSize / 2);
};


// game loop
const gameLoop = () => {
	ctx.clearRect(0, 0, width, height);
	p.update();
	w.update();
	drawMiniMap();
	requestAnimationFrame(gameLoop);
};

gameLoop();
