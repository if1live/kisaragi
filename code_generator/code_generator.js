// Ŭnicode please
"use strict";

var ejs = require('ejs');
var fs = require('fs');
var _ = require('underscore');
var packetDefList = require(__dirname + '/packet_def.json');
var constantDefList = require(__dirname + '/constant_def.json');

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

PacketDefine.prototype.classname = function () {
  return this.name + "Packet";
};
PacketDefine.prototype.funcname = function () {
  var firstCh = this.name[0];
  return firstCh.toLowerCase() + this.name.substr(1);
};

function ConstantDefine(data) {
  var self = this;
  self.data = data;
  
  self.name = data.name;
  self.type = data.type;
  self.value = data.value;
}

ConstantDefine.prototype.js_type = function () {
  if (this.type == 'int' || this.type == 'float') {
    return 'number';
  } else if (this.type == 'string') {
    return 'string';
  } else {
    return this.type;
  }
}

function writePacketCode(template_file, output_path) {
  fs.readFile(__dirname + '/' + template_file, 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }

    var packets = _.map(packetDefList, function (data) {
      return new PacketDefine(data);
    });
    var output = ejs.render(data, { packets: packets }, { rmWhitespace: true });

    fs.writeFile(output_path, output, function (err) {
      if (err) {
        return console.log(err);
      }
      console.log("write : " + output_path);
    });
  });
}

function writeConstantCode(template_file, output_path) {
  fs.readFile(__dirname + '/' + template_file, 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }

    var constants = _.map(constantDefList, function (data) {
      return new ConstantDefine(data);
    });
    var output = ejs.render(data, { constants: constants }, { rmWhitespace: true });

    fs.writeFile(output_path, output, function (err) {
      if (err) {
        return console.log(err);
      }
      console.log("write : " + output_path);
    });
  });
}

writePacketCode('tpl_packet.ejs', __dirname + '/../app/packet/packet.ts');
writePacketCode('tpl_packet_type.ejs', __dirname + '/../app/packet/packet_type.ts');
writePacketCode('tpl_base_packet_factory.ejs', __dirname + '/../app/packet/base_packet_factory.ts');

writeConstantCode('tpl_generated_constants.ejs', __dirname + '/../app/generated_constants.ts')
