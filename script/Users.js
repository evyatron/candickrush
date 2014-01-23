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
    console.log('new player', snapshot.val());
  }

  function onPlayerChanged(snapshot) {
    console.log('player changed', snapshot.val());
  }

  function onPlayerRemoved(snapshot) {
    console.log('player removed', snapshot.val());
  }
  return {
    'init': init
  };
}())