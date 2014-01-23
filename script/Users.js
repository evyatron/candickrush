// will be used to display online users and their "movements" between games
var Users = (function(){
  var el,

      players = {},

      AREA_HEIGHT = 250,
      AREA_WIDTH = 250,
      PADDING_LEFT = 20,
      PADDING_RIGHT = 20,
      PADDING_TOP = 50,
      PADDING_BOTTOM = 30;

  function init(options) {
    !options && (options = {});

    el = options.el;

    var refOnlineUsers = DB.ref('online/');
    refOnlineUsers.on('child_added', onPlayerAdded);
    refOnlineUsers.on('child_changed', onPlayerChanged);
    refOnlineUsers.on('child_removed', onPlayerRemoved);
  }

  function onPlayerAdded(snapshot) {
    var data = snapshot.val();

    if (players[data.id]) {
      return;
    }

    data.elParent = el;
    players[data.id] = new Player(data);
  }

  function onPlayerChanged(snapshot) {
    var data = snapshot.val(),
        player = players[data.id];
    
    if (player) {
      player.update(data);
      if (data.playing) {
        var elLevel = Levels.getLevelElement(data.playing),
            elPlayer = player.getElement(),
            bounds = elLevel.getBoundingClientRect(),
            x = random(bounds.left + PADDING_LEFT, bounds.right - PADDING_RIGHT - elPlayer.offsetWidth),
            y = random(bounds.top + PADDING_TOP, bounds.bottom - PADDING_BOTTOM - elPlayer.offsetHeight);

        player.moveTo(x, y);
      } else {
        player.moveHome();
      }
    }
  }

  function random(from, to) {
    return Math.random() * (to - from) + from;
  }

  function onPlayerRemoved(snapshot) {
    var data = snapshot.val(),
        player = players[data.id];
    
    if (player) {
      player.remove();
    }

    delete players[data.id];
  }

  function Player(data) {
    var self = this,
        id = data.id,
        name = data.name || 'Guest',
        country = data.country || '',
        countryCode = data.countryCode || '',

        x = 0,
        y = 0,

        el;

    function createElement() {
      el = document.createElement('li');

      el.dataset.id = id;
      el.classList.add('at-home');

      updateUI();

      if (data.elParent) {
        data.elParent.appendChild(el);
      }

      x = Math.round(Math.random() * (AREA_WIDTH || (window.innerWidth - 150)));
      y = Math.round((Math.random() * AREA_HEIGHT) + (window.innerHeight - AREA_HEIGHT) - el.offsetHeight);

      moveHome();
    }

    function moveTo(x, y) {
      el.classList.remove('at-home');
      var transform = 'translate(' + x + 'px, ' + y + 'px);';
      el.style.cssText += ';-webkit-transform: ' + transform +
                          ';transform: ' + transform;
    }
    this.moveTo = moveTo;

    function moveHome() {
      moveTo(x, y);
      el.classList.add('at-home');
    }
    this.moveHome = moveHome;

    function getElement() {
      return el;
    }
    this.getElement = getElement;

    function update(data) {
      if (name === data.name &&
          country === data.country &&
          countryCode === data.countryCode) {
        return;
      }

      name = data.name || 'Guest';
      country = data.country || '';
      countryCode = data.countryCode || '';

      updateUI();

      el.classList.add('change');
      window.setTimeout(function() {
        el.classList.remove('change');
      }, 400);
    }
    this.update = update;

    function remove() {
      el.parentNode.removeChild(el);
    }
    this.remove = remove;

    function updateUI() {
      el.title = name + ' from ' + (country || 'somewhere');

      var html = '';
      if (countryCode) {
        html += '<span style="background-image: url(http://www.geonames.org/flags/x/' + countryCode.toLowerCase() + '.gif);"></span>';
      }
      html += '<b>' + name.replace(/</g, '&lt;') + '</b>';
      el.innerHTML = html;
    }

    createElement();
  }

  return {
    'init': init
  };
}())