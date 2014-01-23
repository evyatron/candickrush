var User = (function() {
  var id,
      name,
      country,
      countryCode,
      levels,
      firebaseRef,
      firebasePlaying,
      auth,
      onReady,
      onLevelCompleted,

      firebase = null,
      DEFAULT_NAME = 'Guest';

  function init(options) {
    firebase = options.firebase;
    el = options.el;
    onReady = options.onReady || function(){};
    onLevelCompleted = options.onLevelCompleted || function(){};

    auth = new FirebaseSimpleLogin(firebase, onAuth);
  }

  function onAuth(error, user) {
    if (user) {
      validate(user);
    } else {
      auth.login('anonymous', {
        'rememberMe': true
      });
    }
  }

  function validate(user) {
    id = user && user.id;

    if (!id) {
      onAuth();
      return;
    }

    firebaseRef = firebase.child('users').child(id);

    firebaseRef.once('value', function(data) {
      data = data && data.val() || {};

      name = data.name || DEFAULT_NAME;
      country = data.country;
      countryCode = data.countryCode;
      levels = data.levels || {};

      firebaseRef.update({
        'name': name,
        'online': true,
        'playing': null
      });

      var refOnline = firebase.child('online').child(id);
      refOnline.set(getInfo());
      refOnline.onDisconnect().remove();

      if (!country || !countryCode) {
        getLocation();
      }

      onUserReady();
    });
  }

  function onUserReady() {
    firebaseRef.onDisconnect().update({
      'online': false,
      'playing': null
    });

    updateUI();

    el.querySelector('.name').addEventListener('click', uiChangeName);

    document.body.classList.add('player-ready');

    onReady();
  }

  function startPlaying(level) {
    var levelNumber = level.level;

    firebaseRef.update({
      'playing': levelNumber
    });

    var info = {
      'start': (new Date()).toString(),
      'user': getInfo()
    };

    // build the data as playing/LEVEL/PLAYER/{info}
    firebasePlaying = firebase.child('playing').child(levelNumber).child(id).push(info);
    firebasePlaying.onDisconnect().remove();
  }

  function stopPlaying(info, didWin) {
    firebasePlaying && firebasePlaying.remove();

    firebaseRef.child('playing').remove();

    if (!info) {
      return;
    }

    var levelNumber = info.level.level;

    info.didWin = !!didWin;


    // add a "map" of levels' statuses, for UI
    var levelRef = firebaseRef.child('levels').child(levelNumber);
    levelRef.once('value', function(data) {
      data = data && data.val();
      if (
          !data ||
          !data.didWin || 
          (info.didWin && data.didWin && data.duration > info.duration)
        ) {
        data = {
          'didWin': info.didWin,
          'duration': info.duration
        };

        levelRef.set(data);

        onLevelCompleted(levelNumber, data);
      }
    });

    // add game to global games, add user's info
    info.user = id;

    var gameRef = firebase.child('games').push(info, function() {
      var newGameId = gameRef.name();

      // add game to user's games
      firebaseRef.child('games').child(newGameId).set(info);

      firebase.child('games-by-user').child(id).child(newGameId).set(true);
      firebase.child('games-by-level').child(levelNumber).child(newGameId).set(true);
    });
  }

  function getInfo() {
    return {
      'id': id,
      'name': name || DEFAULT_NAME,
      'country': country || '',
      'countryCode': countryCode || ''
    };
  }

  function getLevelStatus(levelNumber) {
    return levelNumber? (levels || {})[levelNumber] : (levels || {});
  }

  function getLocation() {
    json({
      'url': 'http://ip-api.com/json/',
      'callback': function onLocationGot(data) {
        country = data.country;
        countryCode = data.countryCode;

        firebaseRef.update({
          'country': country || '',
          'countryCode': countryCode || ''
        });

        updateUI();
      }
    });
  }

  function uiChangeName() {
    var newName = (prompt('Enter your name:', name) || '').trim();
    if (!newName || newName === name) {
      return;
    }

    name = newName;

    firebaseRef.update({
      'name': name
    });

    updateUI();
  }

  function updateUI() {
    (el.querySelector('.name') || {}).innerHTML = name.replace(/</g, '&lt');

    if (countryCode) {
      var flagImage = 'url(http://www.geonames.org/flags/x/' + countryCode.toLowerCase() + '.gif)';
      el.querySelector('.country').style.backgroundImage = flagImage;
    }
    
  }

  return {
    'init': init,
    'getInfo': getInfo,
    'getLevelStatus': getLevelStatus,
    'startPlaying': startPlaying,
    'stopPlaying': stopPlaying
  };
}());