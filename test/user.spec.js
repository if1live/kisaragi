/* global describe: false, it: false, beforeEach: false, before: false */
"use strict";

var assert = require('assert');
var User = require('../lib/user');

describe('User[cli]', function() {
  beforeEach(function() {
    // dummy socket
    this.sock = {
      emit: function(cmd, data) { }
    };
  });
  
  describe('#moveLeft()', function() {
    it('success', function() {
      var user = new User('cli', this.sock);
      user.moveLeft();
    });
  });
  describe('#moveRight()', function() {
    it('success', function() {
      var user = new User('cli', this.sock);
      user.moveRight();
    });
  });
  describe('#moveUp()', function() {
    it('success', function() {
      var user = new User('cli', this.sock);
      user.moveUp();
    });
  });
  describe('#moveDown()', function() {
    it('success', function() {
      var user = new User('cli', this.sock);
      user.moveDown();
    });
  });
});

describe('User[svr]', function() {
  beforeEach(function() {
  
  });
});

