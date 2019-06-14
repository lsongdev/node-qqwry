const stream = require('stream');

class QQwryDecoder extends stream.Transform {
  constructor(key, options) {
    super(options);
    this._key = key;
    this._writeN = 0x200;
  }
  _transform(chunk, encoding, callback) {
    if (this._writeN <= 0) return callback(null, chunk);
    let max = this._writeN > chunk.length ? chunk.length : this._writeN;
    let key = this._key;
    this._writeN -= max;
    for (let i = 0; i < max; i++) {
      key *= 0x805;
      key++;
      key &= 0xff;
      chunk[i] = chunk[i] ^ key;
    }
    this._key = key;
    return callback(null, chunk);
  }
  _flush(cb) {
    cb();
  }
}

module.exports = QQwryDecoder;