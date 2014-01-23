var Levels = (function() {
  var el,
      onLevelSelect,
      levels = [];

  function init(options) {
    el = options.el;
    onLevelSelect = options.onSelect || function(){};

    add(options.levels, options.status);
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

    elLevel.dataset.level = levels.length;
    elLevel.innerHTML = '<h3>' + level.name + '</h3>' +
                        '<span style="background-image: url(' + level.image + ');"></span>' +
                        '<em class="status"></em>';

    elLevel.addEventListener('click', onLevelClick);

    el.appendChild(elLevel);

    addLevelStatus(elLevel.dataset.level, status);
  }

  function addLevelStatus(level, status) {
    var elLevel = el.querySelector('li[data-level = "' + level + '"]'),
        elStatus = elLevel.querySelector('.status');

    elLevel.classList.remove('status-win');
    elLevel.classList.remove('status-lose');
    elStatus.innerHTML = '';

    if (status) {
      elLevel.classList.add('status-' + (status.didWin? 'win' : 'lose'));
      elStatus.innerHTML = (status.duration || 0) + 's';
    }
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