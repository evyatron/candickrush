var User = (function() {
  var id,
      name,
      country,
      countryCode,
      firebaseRef,
      firebasePlaying,

      firebase = null,
      DEFAULT_NAME = 'Dick',
      KEY_USER_ID = 'dickUserId';

  function init(options) {
    firebase = options.firebase;
    el = options.el;
    id = Storage.get(KEY_USER_ID);

    if (id) {
      firebaseRef = firebase.child('users').child(id);
      firebaseRef.once('value', function(data) {
        data = data && data.val();
        if (data) {
          name = data.name || DEFAULT_NAME;
          country = data.country;
          countryCode = data.countryCode;

          firebaseRef.update({
            'online': true,
            'playing': null
          });

          onUserReady();
        } else {
          newUser();
        }
      });
    } else {
      newUser();
    }
  }

  function onUserReady() {
    firebaseRef.onDisconnect().update({
      'online': false,
      'playing': null
    });

    updateUI();

    el.querySelector('.name').addEventListener('click', uiChangeName);

    document.body.classList.add('player-ready');
  }

  function startPlaying(level) {
    var levelNumber = level.level;

    firebaseRef.update({
      'playing': levelNumber
    });

    var info = {
      'start': (new Date()).toString(),
      'user': {
        'id': id,
        'name': name,
        'country': country,
        'countryCode': countryCode
      }
    };

    firebasePlaying = firebase.child('playing').child(levelNumber).push(info);
    firebasePlaying.onDisconnect().remove();
  }

  function stopPlaying(info, didWin) {
    firebasePlaying && firebasePlaying.remove();

    firebaseRef.child('playing').remove();

    if (!info) {
      return;
    }

    info.didWin = !!didWin;

    // add game to user's games
    firebaseRef.child('games').push(info);

    // add game to global games, add user's info
    info.user = {
      'id': id,
      'name': name,
      'country': country,
      'countryCode': countryCode
    };

    var gameRef = firebase.child('games').push(info, function() {
      var newGameId = gameRef.name();

      firebase.child('games-by-user').child(id).child(newGameId).set(true);
      firebase.child('games-by-level').child(info.level.level).child(newGameId).set(true);
    });
  }

  function newUser() {
    firebaseRef = firebase.child('users').push({
      'name': DEFAULT_NAME,
      'online': true
    }, function onUserCreated(data) {
      id = firebaseRef.name();
      name = DEFAULT_NAME;
      Storage.set(KEY_USER_ID, id);
      getLocation();
      onUserReady();
    });
  }

  function getLocation() {
    json({
      'url': 'http://ip-api.com/json/',
      'callback': function onLocationGot(data) {
        country = data.country;
        countryCode = data.countryCode;

        firebaseRef.update({
          'country': country,
          'countryCode': countryCode
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
    'startPlaying': startPlaying,
    'stopPlaying': stopPlaying
  };
}());