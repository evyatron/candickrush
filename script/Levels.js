var Levels = (function() {
  var el,
      onLevelSelect,
      levels = [];

  function init(options) {
    el = options.el;
    onLevelSelect = options.onSelect || function(){};

    add(options.levels);
  }

  function add(levels) {
    if (!Array.isArray(levels)) {
      levels = [levels];
    }

    for (var i = 0, level; level = levels[i++];) {
      level.level = i;
      addLevel(level);
    }
  }

  function addLevel(level) {
    levels.push(level);

    var elLevel = document.createElement('li');

    elLevel.dataset.level = levels.length;
    elLevel.innerHTML = '<h3>' + level.name + '</h3>' +
                        '<span style="background-image: url(' + level.image + ');"></span>';
    elLevel.addEventListener('click', onLevelClick);

    el.appendChild(elLevel);
  }

  function onLevelClick(e) {
    var elLevel = e.target,
        index = elLevel.dataset.level - 1;

    onLevelSelect(levels[index], index);
  }

  return {
    'init': init,
    'add': add
  };
}());