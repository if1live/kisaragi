(function() {
  var _global = this;
  
  var Level = function() {
    // TODO
    this.foo = 1;
  };


  if(typeof(module) !== 'undefined' && module.exports) {
    // node.js module
    module.exports = Level;
  } else {
    // global (browser)
    _global.Level = Level;
  }
}).call(this);