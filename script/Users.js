// will be used to display online users and their "movements" between games
var Users = (function(){
  var el

  function init(options) {
    !options && (options = {});

    el = options.el;

    var refOnlineUsers = DB.ref('online/');
    refOnlineUsers.on('child_added', onPlayerAdded);
    refOnlineUsers.on('child_changed', onPlayerChanged);
    refOnlineUsers.on('child_removed', onPlayerRemoved);
  }

  function onPlayerAdded(snapshot) {
    
  }

  function onPlayerChanged(snapshot) {
    
  }

  function onPlayerRemoved(snapshot) {
    
  }

  return {
    'init': init
  };
}())