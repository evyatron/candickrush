var App = (function() {
  var LEVELS = [
        {
          'id': 'beginners',
          'name': 'Beginners',
          'image': 'images/levels/beginners.png',
          'start': [0, 150]
        },
        {
          'id': 'easypeasy',
          'name': 'Easy Peasy',
          'image': 'images/levels/easypeasy.png',
          'start': [0, 290]
        },
        {
          'id': 'isiteasy',
          'name': 'Is It Easy?',
          'image': 'images/levels/isiteasy.png',
          'start': [0, 125]
        },
        {
          'id': 'intermediate',
          'name': 'Intermediate',
          'image': 'images/levels/inter.png',
          'start': [0, 430]
        },
        {
          'id': 'decisions',
          'name': 'Decisions, Decisions',
          'image': 'images/levels/decisions.png',
          'start': [0, 280]
        },
        {
          'id': 'curveball',
          'name': 'Oh you can do that?',
          'image': 'images/levels/curveball.png',
          'start': [0, 550]
        },
        {
          'id': 'waitwhat',
          'name': 'Wait, What?',
          'image': 'images/levels/what.png',
          'start': [0, 305]
        }
      ];

  function init() {
    document.getElementById('info-trigger').addEventListener('click', toggleInfo);
    document.getElementById('info-close').addEventListener('click', toggleInfo);

    DB.init();

    Users.init({
      'el': document.getElementById('players')
    });

    User.init({
      'el': document.getElementById('player'),
      'onReady': onPlayerReady,
      'onLevelCompleted': onLevelCompleted
    });
  }

  function onPlayerReady() {
    Game.init({
      'el': document.getElementById('game'),
      'elPlayer': document.getElementById('dick'),
      'elClock': document.getElementById('clock'),
      'onStart': onGameStart,
      'onClose': onGameClose,
      'onGameLose': onGameLose,
      'onGameWin': onGameWin
    });

    Levels.init({
      'el': document.getElementById('levels'),
      'levels': LEVELS,
      'status': User.getLevelStatus(),
      'onSelect': onLevelSelect
    });

    window.addEventListener('keyup', onKeyUp);

    document.body.classList.add('ready');
  }

  function toggleInfo() {
    document.body.classList.toggle('info');
  }

  function onKeyUp(e) {
    // esc
    if (e.keyCode === 27) {
      if (document.body.classList.contains('info')) {
        document.body.classList.remove('info')
      }
    }
  }

  function onLevelSelect(level) {
    Game.load(level);
  }

  function onGameStart(level) {
    User.startPlaying(level);
  }

  function onGameClose() {
    User.stopPlaying();
  }
  
  function onGameLose(data) {
    User.stopPlaying(data, false);
  }
  
  function onGameWin(data) {
    User.stopPlaying(data, true);
  }

  function onLevelCompleted(level, data) {
    Levels.addLevelStatus(level, data);
  }

  return {
    'init': init
  };
}());

function json(options) {
  var url = options.url,
      callback = options.callback,
      elScript = document.createElement('script'),
      cbName = 'callback_' + Date.now();

  window[cbName] = function(data) {
    delete window[cbName];
    elScript.parentNode.removeChild(elScript);
    callback(data);
  };

  url += (url.indexOf('?') === -1? '?' : '&') + 'callback=' + cbName;

  elScript.src = url;
  document.body.appendChild(elScript);
}

var Storage = (function(){
  function set(key, value) {
    if (typeof value === 'object') {
      try {
        value = JSON.stringify(value);
      } catch(ex) {
        console.error('Trying to serialize: ', value);
      }
    }

    try {
      localStorage[key] = value;
    } catch(ex) {
      console.warn('Can\'t use localStorage?', ex);
    }
  }

  function get(key) {
    var value = null;

    try {
      value = localStorage[key];
    } catch(ex) {
      console.warn('Can\'t use localStorage?', ex);
    }

    if (value) {
      try {
        value = JSON.parse(value);
      } catch(ex) {}
    }

    return value;
  }

  function remove(key) {
    localStorage.remove(key);
  }

  return {
    set: set,
    get: get,
    remove: remove
  };
}());

// attach the .compare method to Array's prototype to call it on any array
// http://stackoverflow.com/questions/7837456/comparing-two-arrays-in-javascript
Array.prototype.compare = function (array) {
    // if the other array is a falsy value, return
    if (!array) {
      return false;
    }

    // compare lengths - can save a lot of time
    if (this.length != array.length) {
      return false;
    }

    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] !== array[i]) {
        return false;
      }
    }

    return true;
}