var DB = (function() {
  var firebase;

  function init() {
    firebase = new Firebase('https://candickrun.firebaseio.com');
  }

  function get(path, callback) {
    var ref = firebase.child(path);
    ref.once('value', callback);

    return ref;
  }

  function set(path, data, callback) {
    var ref = firebase.child(path);
    ref.set(data, callback);

    return ref;
  }

  function push(path, data, callback) {
    var ref = firebase.child(path).push(data, callback);
    if (data.removeOnDisconnect) {
      ref.onDisconnect().remove();
    }

    return ref;
  }

  function remove(path, callback) {
    return firebase.child(path).remove(callback);
  }

  var User = {
    'login': function login(callback) {
      !callback && (callback = function(){});

      var auth = new FirebaseSimpleLogin(firebase, function onAuth(error, user) {
        if (user) {
          User.validate(user, callback);
        } else {
          auth.login('anonymous', {
            'rememberMe': true
          });
        }
      });

      return auth;
    },

    'validate': function validate(user, callback) {
      !callback && (callback = function(){});

      var refUser = firebase.child('users').child(user.id);
      refUser.once('value', function onGotUser(data) {
        data = (data && data.val()) || {};
        data.id = user.id;
        callback(data);
      });
    },

    'online': function online(user) {
      var refUser = firebase.child('users').child(user.id);
      refUser.update({
        'online': true,
        'playing': null
      });
      refUser.onDisconnect().update({
        'online': false,
        'playing': null
      });

      var refOnline = firebase.child('online').child(user.id);
      refOnline.set(user);
      refOnline.onDisconnect().remove();
    },

    'update': function update(user) {
      var refUser = firebase.child('users').child(user.id);
      refUser.update(user);
    }
  };

  return {
    'init': init,
    'push': push,
    'get': get,
    'set': set,
    'remove': remove,
    'User': User
  };
}());