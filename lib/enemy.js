function Enemy(id, pos) {
  var self = this;
  self.type = 'enemy';

  self.id = id;
  self.pos = pos;
}

module.exports.Enemy = Enemy;
