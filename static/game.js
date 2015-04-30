define(['underscore'], function(_) {
  // shared game clinet library
  function User(obj) {
    
  }
  User.prototype.foo = function() {
    console.log("requirejs work!");
  };
  
  function World() {
    var self = this;
  }
  
  return {
    User: User,
    World: World
  };
});
