// Ŭnicode please
"use strict";

var ejs = require('ejs');
var fs = require('fs');
var _ = require('underscore');
var packetDefList = require('./packet_def.json');

function PacketAttribute(data) {
  var self = this;
  self.name = data[0];
  self.type = data[1];

  if(data[2] !== undefined) {
    self.defaultValue = data[2];
  } else {
    if(self.type === 'number') {
      self.defaultValue = 0;
    } else if(self.type === 'string') {
      self.defaultValue = "''";
    } else {
      self.defaultValue = 'null';
    }
  }
}


function PacketDefine(data) {
  var self = this;
  self.data = data;
  
  self.name = data.name;
  self.command = data.command;
  self.attrs = _.map(data.content, function(row) {
    return new PacketAttribute(row);
  });
}

PacketDefine.prototype.classname = function() {
  return this.name + "Packet";
}

fs.readFile('./packet/template.ejs', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  var packets = _.map(packetDefList, function(data) {
    return new PacketDefine(data);
  });
  
  var output = ejs.render(data, {packets: packets}, {rmWhitespace: true});
  console.log(output);
});

