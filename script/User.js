var User = (function() {
  var id,
      name,
      country,
      countryCode,
      levels,
      onReady,
      onLevelCompleted,

      refPlaying,

      DEFAULT_NAME = 'Guest';

  function init(options) {
    el = options.el;
    onReady = options.onReady || function(){};
    onLevelCompleted = options.onLevelCompleted || function(){};

    DB.User.login(onLogin);
  }

  function onLogin(user) {
    id = user.id;
    name = user.name || DEFAULT_NAME;
    country = user.country;
    countryCode = user.countryCode;
    levels = user.levels || {};

    DB.User.online(getInfo());

    if (!country || !countryCode) {
      getLocation();
    }

    onUserReady();
  }

  function onUserReady() {
    updateUI();

    el.querySelector('.name').addEventListener('click', uiChangeName);

    document.body.classList.add('player-ready');

    onReady();
  }

  function startPlaying(level) {
    DB.User.update({
      'id': id,
      'playing': level.id
    });

    refPlaying = DB.set('playing/' + level.id + '/' + id, {
      'start': (new Date()).toString(),
      'user': getInfo(),
      'removeOnDisconnect': true
    });
  }

  function stopPlaying(info, didWin) {
    refPlaying && refPlaying.remove();

    DB.remove('users/' + id + '/playing');
    DB.remove('online/' + id + '/playing');

    if (!info) {
      return;
    }

    var level = info.level,
        levelId = level.id;

    info.didWin = !!didWin;

    // add a "map" of levels' statuses, for UI
    DB.get('users/' + id + '/levels/' + levelId, function(data) {
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

        DB.set('users/' + id + '/levels/' + levelId, data);

        onLevelCompleted(levelId, data);
      }
    })

    // add game to global games, add user's info
    info.user = id;

    var ref = DB.push('games', info, function() {
      var gameId = ref.name();

      // add game to user's games
      DB.set('games/' + gameId, info);
      DB.set('games-by-user/' + id + '/' + gameId, true);
      DB.set('games-by-level/' + level.id + '/' + gameId, true);
    })
  }

  function getInfo() {
    return {
      'id': id,
      'name': name || DEFAULT_NAME,
      'country': country || '',
      'countryCode': countryCode || ''
    };
  }

  function getLevelStatus(levelId) {
    if (levelId && typeof levelId === 'object') {
      levelId = levelId.id;
    }

    !levels && (levels = {});

    return levelId? levels[levelId] : levels;
  }

  function getLocation() {
    json({
      'url': 'http://ip-api.com/json/',
      'callback': function onLocationGot(data) {
        if (data) {
          setCountry(data.country, data.countryCode);
        }
      }
    });
  }

  function uiChangeName() {
    var newName = (prompt('Enter your name:', name) || '').trim();
    if (!newName || newName === name) {
      return;
    }

    setName(newName);
  }

  function setCountry(newCountry, newCountryCode) {
    country = newCountry || '';
    countryCode = newCountryCode || '';
    update();
  }

  function setName(newName) {
    name = newName || DEFAULT_NAME;
    update();
  }

  function update() {
    DB.User.update(getInfo());
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
    'setCountry': setCountry,
    'setName': setName,
    'startPlaying': startPlaying,
    'stopPlaying': stopPlaying
  };
}());