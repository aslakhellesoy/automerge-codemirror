'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
function randomString(len) {
  var chars = '0123456789\nABCDEF\nGHIJKLM\nNOPQRSTUVWXTZ\nabcde\nfghiklmnop\nqrstuvwxyz'
  var result = ''
  for (var i = 0; i < len; i++) {
    var rnum = randomPositiveInt(chars.length)
    result += chars.substring(rnum, rnum + 1)
  }
  return result
}
exports.randomString = randomString
function randomPositiveInt(max) {
  return Math.floor(Math.random() * max) + 1
}
exports.randomPositiveInt = randomPositiveInt
//# sourceMappingURL=random.js.map
