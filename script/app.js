var App = (function() {
  var firebase,
      LEVELS = [
        {
          'name': 'Beginners',
          'image': 'images/levels/1.png',
          'start': [0, 150]
        },
        {
          'name': 'First Level',
          'image': 'images/levels/2.png',
          'start': [0, 430]
        },
        {
          'name': 'Second Level',
          'image': 'images/levels/3.png',
          'start': [0, 125]
        }
      ];

  function init() {
    firebase = new Firebase('https://candickrun.firebaseio.com');

    User.init({
      'firebase': firebase,
      'el': document.getElementById('player')
    });

    Game.init({
      'firebase': firebase,
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
      'onSelect': onLevelSelect
    });
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