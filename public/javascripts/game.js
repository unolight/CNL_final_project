var canvas = null;
var stage = null;
var circle = null;
var line = null;
var circles = {};
var container = {};
var keys = new Array(128);
var socket = io();
var actualX, actualY;
var oldX, oldY;

function init() {
	stage = new createjs.Stage('canvas');
	canvas = document.getElementById('canvas');
	//stage.autoClear = false;
	
	//canvas.style.background = '#000';

	container = new createjs.Container();
	canvas.style.background = '#708090';
	actualX = 1000;
	actualY = 1000;
	drawGridLines();

	circle = new createjs.Shape();
	circle.graphics.ss(3).s('black').f('DeepSkyBlue').drawCircle(0, 0, 30);
	circle.x = window.innerWidth/2;
	circle.y = window.innerHeight/2;
	container.addChild(circle);
	stage.addChild(container);
	
   	/*var polystar = new createjs.Shape();
    polystar.graphics.setStrokeStyle(1).beginStroke("#0000ff").drawPolyStar(360,60,10,5,6,20);
    stage.addChild(polystar);*/
	
	resizeCanvas();
	window.addEventListener('resize', resizeCanvas);
	document.addEventListener('keydown', function (event) {
		keys[event.keyCode] = true;
	});
	document.addEventListener('keyup', function (event) {
		keys[event.keyCode] = false;
	});
	document.addEventListener('keypress', function (event) {
		if (event.keyCode == 13)
			socket.emit('hello', {x: circle.x, y: circle.y});
	});
	
	createjs.Ticker.addEventListener('tick', tick);
	createjs.Ticker.timingMode = createjs.Ticker.RAF;
	// createjs.Ticker.setFPS(60);
	
	// setInterval(sendPositionInfo, 10);
	socket.on('position', recvPositionInfo);
	socket.on('hello', recvHelloMsg);
}

function drawGridLines(){
	stage.removeChild(line);
	line = new createjs.Shape();
	// draw horizontal lines
	for (var i = 1; i*50 <= window.innerHeight; i++) {
		line.graphics.setStrokeStyle(1).beginStroke('black').moveTo(0,50+(-actualY%50)+50*i).lineTo(window.innerWidth,50+(-actualY%50)+50*i).es();
	};
	// draw vertical lines
	for (var i = 1; i*50 <= window.innerWidth; i++) {
		line.graphics.setStrokeStyle(1).beginStroke('black').moveTo(50+(-actualX%50)+50*i,0).lineTo(50+(-actualX%50)+50*i,window.innerHeight).es();
	};
   	stage.addChild(line);
}

function tick(event) {
	var d = Math.round(event.delta * 0.3);
	if (keys[37] && actualX > d)
		actualX -= d;
	else if (keys[38] && actualY > d)
		actualY -= d;
	else if (keys[39] && actualX+d < 2000)
		actualX += d;
	else if (keys[40] && actualY+d < 2000)
		actualY += d;
	
	drawGridLines();
	sendPositionInfo();
	stage.update();
}

function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

function sendPositionInfo() {
	if (actualX != oldX || actualY != oldY) {
		oldX = actualX;
		oldY = actualY;
		socket.emit('position', {
			x: actualX,
			y: actualY
		});
	}
}

function recvPositionInfo(data) {
	if (!(data.id in circles)) {
		var c = new createjs.Shape();
		c.graphics.ss(3).s('black').f('Pink').drawCircle(0, 0, 30);
		c.x = data.x;
		c.y = data.y;
		circles[data.id] = c;
		stage.addChild(c);
	} else {
		// createjs.Tween.get(circles[data.id]).to({x: data.x, y: data.y}, 10);
		circles[data.id].x = data.x;
		circles[data.id].y = data.y;
	}
}

function recvHelloMsg(msg) {
	var text = new createjs.Text('Hello', '20px Arial', 'White');
	text.x = msg.x;
	text.y = msg.y;
	text.textAlign = 'center';
	text.textBaseline = 'middle';
	stage.addChild(text);
	createjs.Tween.get(text)
		.wait(1000)
		.to({alpha: 0, scaleX: 3, scaleY: 3}, 300)
		.call(function () {
			stage.removeChild(text);
		});
	// setTimeout(function () {
	// 	stage.removeChild(text);
	// }, 1000);
}