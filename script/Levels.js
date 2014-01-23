var Levels = (function() {
  var el,
      onLevelSelect,
      levels = [];

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
      level.level = i;
      addLevel(level, status[i]);
    }
  }

  function addLevel(level, status) {
    levels.push(level);

    var elLevel = document.createElement('li');

    elLevel.className = 'playing-0';

    elLevel.dataset.level = levels.length;
    elLevel.innerHTML = '<h3>' + level.name + '</h3>' +
                        '<span class="image" style="background-image: url(' + level.image + ');"></span>' +
                        '<div class="status">Record: <span class="record"></span></div>' +
                        '<div class="playing">Playing: <span class="playing-num">0</span></div>';

    elLevel.addEventListener('click', onLevelClick);

    el.appendChild(elLevel);

    addLevelStatus(elLevel.dataset.level, status);
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

  function setPlaying(levelNumber, players) {
    var elLevel = getLevelElement(levelNumber),
        numberOfPlayers = Object.keys(players || {}).length;

    elLevel.className = elLevel.className.replace(/playing-\d+/, '');
    elLevel.classList.add('playing-' + numberOfPlayers);
    (elLevel.querySelector('.playing-num') || {}).innerHTML = numberOfPlayers;
  }

  function getLevelElement(levelNumber) {
    return elLevel = el.querySelector('li[data-level = "' + levelNumber + '"]');
  }

  function onLevelClick(e) {
    var elLevel = e.target,
        index = elLevel.dataset.level - 1;

    onLevelSelect(levels[index], index);
  }

  return {
    'init': init,
    'add': add,
    'addLevelStatus': addLevelStatus
  };
}());