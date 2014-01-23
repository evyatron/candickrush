var Levels = (function() {
  var el,
      onLevelSelect,
      levels = {};

  function init(options) {
    el = options.el;
    onLevelSelect = options.onSelect || function(){};

    add(options.levels, options.status);

    DB.ref('playing/').on('value', onPlayingChange);
  }

  function add(levels, status) {
    if (!Array.isArray(levels)) {
      levels = [levels];
    }

    for (var i = 0, level; level = levels[i++];) {
      addLevel(level, status[level.id]);
    }
  }

  function addLevel(level, status) {
    levels[level.id] = level;

    var elLevel = document.createElement('li');

    elLevel.className = 'playing-0';

    elLevel.dataset.level = level.id;
    elLevel.innerHTML = '<h3>' + level.name + '</h3>' +
                        '<span class="image" style="background-image: url(' + level.image + ');"></span>' +
                        '<div class="status">Record: <span class="record"></span></div>' +
                        '<div class="playing">Playing: <span class="playing-num">0</span></div>';

    elLevel.addEventListener('click', onLevelClick);

    el.appendChild(elLevel);

    addLevelStatus(level, status);
  }

  function addLevelStatus(level, status) {
    var elLevel = getLevelElement(level),
        elStatus = elLevel.querySelector('.record');

    elLevel.classList.remove('status-win');
    elLevel.classList.remove('status-lose');
    elStatus.innerHTML = '';

    if (status) {
      elLevel.classList.add('status-' + (status.didWin? 'win' : 'lose'));
      elStatus.innerHTML = (status.duration || 0) + 's';
    }
  }

  function onPlayingChange(snapshot) {
    var levelsPlaying = (snapshot && snapshot.val()) || {};

    for (var i = 0, level; level = levels[i++];) {
      setPlaying(i, levelsPlaying[i]);
    }
  }

  function setPlaying(level, players) {
    var elLevel = getLevelElement(level),
        numberOfPlayers = Object.keys(players || {}).length;

    elLevel.className = elLevel.className.replace(/playing-\d+/, '');
    elLevel.classList.add('playing-' + numberOfPlayers);
    (elLevel.querySelector('.playing-num') || {}).innerHTML = numberOfPlayers;
  }

  function getLevelElement(level) {
    if (typeof level === 'object') {
      level = level.id;
    }
    return el.querySelector('li[data-level = "' + level + '"]');
  }

  function onLevelClick(e) {
    var elLevel = e.target,
        id = elLevel.dataset.level;

    onLevelSelect(levels[id]);
  }

  return {
    'init': init,
    'add': add,
    'addLevelStatus': addLevelStatus
  };
}());