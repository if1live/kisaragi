
function AdminHelper() {
}
AdminHelper.prototype.gameObjectToChar = function(obj) {
  if(typeof obj === 'number') {
    var table = {
      '0': '.',
      '1': '1'
    };
    return table[obj];

  }
  if(obj.type === 'user') {
    return 'U';

  } else if(obj.type === 'enemy') {
    return 'E';
  }
  // unknown
  return 'X';
};

var exports = module.exports;
// for admin
exports.AdminHelper = AdminHelper;
