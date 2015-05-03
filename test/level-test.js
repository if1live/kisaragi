var vows = require('vows');
var assert = require('assert');
var level = require('../lib/level');


vows.describe('Level').addBatch({
  'dummy': {
    topic: null,
    'succes': function(topic) {
      console.log(level);
      console.log(topic);
    }
  }
}).export(module);

