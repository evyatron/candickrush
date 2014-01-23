var Game = (function() {
  var el,
      elPlayer,
      elClock,
      elStart,
      elEndPoints,

      playerX = 0,
      playerY = 0,
      previousX = 0,
      flipped = false,

      playerWidth = 0,
      playerHeight = 0,

      onStart, onClose, onGameLose, onGameWin,

      dateStart,
      timeStart = 0,
      intervalTimer = null,

      context = null,
      width = 0,
      height = 0,
      currentLevel,
      currentEdges = [],

      FLIP_THRESHOLD = 1,
      EDGE_THRESHOLD = 6,

      IS_ACTIVE = false,

      CLASSES = {
        READY: 'game-ready',
        ACTIVE: 'game-running',
        GAME_LOST: 'game-lose',
        GAME_WON: 'game-win'
      };


  function init(options) {
    el = options.el;
    elPlayer = options.elPlayer;
    elClock = options.elClock;

    elStart = el.querySelector('.start');
    elEndPoints = el.querySelector('.end-points');

    onStart = options.onStart || function(){};
    onClose = options.onClose || function(){};
    onGameLose = options.onGameLose || function(){};
    onGameWin = options.onGameWin || function(){};

    playerWidth = elPlayer.offsetWidth;
    playerHeight = elPlayer.offsetHeight;

    var elCanvas = document.createElement('canvas');
    elCanvas.width = width = el.offsetWidth;
    elCanvas.height = height = el.offsetHeight;
    context = elCanvas.getContext('2d');
    el.appendChild(elCanvas);
  }

  function start() {
    window.clearInterval(intervalTimer);

    IS_ACTIVE = true;
    onStart(currentLevel);

    elStart.removeEventListener('mousedown', mouseOnStart);    
    document.body.classList.add(CLASSES.ACTIVE);

    dateStart = new Date();
    timeStart = Date.now();
    intervalTimer = window.setInterval(tick, 1000 / 30);
  }

  function load(level) {
    elClock.innerHTML = '0:00';
    currentLevel = level;

    (el.querySelector('.level-name') || {}).innerHTML = level.name || ('Level ' + level.level);

    context.clearRect(0, 0, width, height);

    var image = new Image();
    image.onload = function() {
      context.drawImage(this, 0, 0, width, height);
      onLoad();
    };
    image.src = level.image;
  }

  function onLoad() {
    document.body.classList.remove(CLASSES.GAME_LOST);

    playerX = currentLevel.start[0];
    playerY = currentLevel.start[1];

    drawFinishPoints();

    update();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('keyup', onKeyUp);
    el.querySelector('.close').addEventListener('click', close);
    document.body.classList.add(CLASSES.READY);

    elStart.style.top = playerY + 'px';
    elStart.addEventListener('mouseover', mouseOnStart);
  }

  function drawFinishPoints() {
    var endPoints = currentLevel.end || [];
    
    if (!Array.isArray(endPoints[0])) {
      endPoints = [endPoints];
    }

    for (var i = 0, point; point = endPoints[i++];) {
      var x = point[0],
          y = point[1],
          elPoint = document.createElement('div');

      if (typeof x !== 'number') {
        x = width;
      }
      if (typeof y !== 'number') {
        y = height/2;
      }

      elPoint.className = 'end-point';
      elPoint.style.cssText += 'top: ' + y + 'px;' +
                               'left: ' + x + 'px;';

      elEndPoints.appendChild(elPoint);
    }
  }

  function removeFinishPoints() {
    elEndPoints.innerHTML = '';
  }

  function mouseOnStart() {
    window.setTimeout(start, 150);
  }

  function stop() {
    window.clearInterval(intervalTimer);
    document.body.classList.remove(CLASSES.ACTIVE);

    IS_ACTIVE = false;
    window.removeEventListener('mousemove', onMouseMove);
  }

  function close() {
    stop();
    window.removeEventListener('keyup', onKeyUp);
    el.querySelector('.close').removeEventListener('click', close);

    removeFinishPoints();

    document.body.classList.remove(CLASSES.ACTIVE);
    document.body.classList.remove(CLASSES.GAME_WON);
    document.body.classList.remove(CLASSES.GAME_LOST);
    document.body.classList.remove(CLASSES.READY);

    onClose();
  }

  function die() {
    stop();
    clearEdges();
    document.body.classList.add(CLASSES.GAME_LOST);

    onGameLose(getGameInfo());
  }

  function win() {
    stop();
    clearEdges();
    document.body.classList.add(CLASSES.GAME_WON);

    onGameWin(getGameInfo());
  }

  function getGameInfo() {
    return {
      'start': dateStart.toString(),
      'end': (new Date()).toString(),
      'duration': Math.round((Date.now() - timeStart) / 1000),
      'level': currentLevel
    };
  }

  function clearEdges() {
    document.body.classList.remove('near-top');
    document.body.classList.remove('near-bottom');
    document.body.classList.remove('near-left');
    document.body.classList.remove('near-right');
  }

  function tick() {
    var diff = Date.now() - timeStart,
        seconds = Math.round(diff / 1000);

    var m = Math.floor(seconds/60),
        s = seconds % 60;

    (s < 10) && (s = '0' + s);

    elClock.innerHTML = m + ':' + s;
  }

  function checkCollision() {
    var x = Math.max(playerX - playerWidth / 2 - EDGE_THRESHOLD, 0),
        y = Math.max(playerY - playerHeight / 2 - EDGE_THRESHOLD, 0),
        w = Math.min(playerWidth + EDGE_THRESHOLD * 2, width),
        h = Math.min(playerHeight + EDGE_THRESHOLD * 2, height),
        playerArea = context.getImageData(x, y, w, h).data,
        marginTop = EDGE_THRESHOLD,
        marginBottom = h - EDGE_THRESHOLD,
        marginLeft = EDGE_THRESHOLD,
        marginRight = w - EDGE_THRESHOLD,
        isOutside = false,
        edges = [],
        color;

    if (playerX + playerWidth/2 >= width) {
      win();
      return true;
    }

    for (var i = 0, n = playerArea.length, x, y; i < n; i += 4) {
      y = Math.floor((i / 4) / w);
      x = (i / 4) - (y * w);

      // pixel checked isn't white
      if (playerArea[i] + playerArea[i + 1] + playerArea[i + 2] !== 765) {
        var xOK = x > marginLeft && x < marginRight,
            yOK = y > marginTop && y < marginBottom;

        if (y < marginTop && xOK) {
          edges.push('near-top');
        }
        if (y > marginBottom && xOK) {
          edges.push('near-bottom');
        }
        if (x < marginLeft && yOK) {
          edges.push(flipped? 'near-right' : 'near-left');
        }
        if (x > marginRight && yOK) {
          edges.push(flipped? 'near-left' : 'near-right');
        }

        if (xOK && yOK) {
          edges = [];
          isOutside = true;
        }
      }
    }

    if (!currentEdges.compare(edges)) {
      clearEdges();

      if (edges.length) {
        for (var i = 0, edge; edge = edges[i++];) {
          document.body.classList.add(edge);
        }
      }

      currentEdges = edges;
    }

    if (isOutside) {
      die();
      return true;
    }
  }

  function onKeyUp(e) {
    if (e.keyCode === 27) {
      close();
    }
  }

  function onMouseMove(e) {
    if (!IS_ACTIVE) {
      return;
    }

    var x = e.pageX - el.offsetLeft,
        y = e.pageY - el.offsetTop;

    playerX = Math.min(Math.max(x, playerWidth/2), width - playerWidth/2);
    playerY = Math.min(Math.max(y, playerHeight/2), height - playerHeight/2);

    if ((flipped && playerX - previousX > FLIP_THRESHOLD) ||
        (!flipped && previousX - playerX > FLIP_THRESHOLD)) {
      flipped = !flipped;
    }

    previousX = playerX;

    var didCollide = checkCollision();

    if (didCollide) {
      return;
    } else {
      update();
    }
  }

  function update() {
    playerX = Math.min(Math.max(playerX, playerWidth/2), width - playerWidth/2);
    playerY = Math.min(Math.max(playerY, playerHeight/2), height - playerHeight/2);

    var transform = 'translate(' + playerX + 'px, ' + playerY + 'px)';
    
    if (flipped) {
      transform += ' scale(-1, 1)';
    }

    elPlayer.style.cssText += '-webkit-transform: ' + transform + ';' +
                              'transform: ' + transform + ';';
  }

  return {
    'init': init,
    'start': start,
    'stop': stop,
    'load': load
  };
}());