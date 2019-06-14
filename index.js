const fs = require('fs');
const { debuglog } = require('util');
const { decode } = require('fast-gbk')();

const debug = debuglog('qqwry');

const IP_RECORD_LENGTH = 7;
const REDIRECT_MODE_1 = 1;
const REDIRECT_MODE_2 = 2;

const ip2long = ip =>
  ip.split('.').reduce((n, p) => (n << 8) + parseInt(p), 0) >>> 0;

const long2ip = int => {
  if (int < 0 || int > 0xffffffff)
    throw 'The IP number is not normal! >> ' + int;
  return (
    (int >>> 24) +
    '.' +
    ((int >>> 16) & 0xff) +
    '.' +
    ((int >>> 8) & 0xff) +
    '.' +
    ((int >>> 0) & 0xff)
  );
};

const createReader = buffer => {
  var max = buffer.length;
  return {
    readUIntLE(start, length) {
      start = start || 0;
      length = length < 1 ? 1 : length > 6 ? 6 : length;
      return buffer.readUIntLE(start, length);
    },
    getStringByteArray(start) {
      var B = start || 0;
      var toarr = [];
      for (var i = B; i < max; i++) {
        var s = buffer[i];
        if (s === 0) break;
        toarr.push(s);
      }
      return toarr;
    }
  };
};
/*
           HEADER         |   RECORDS   | INDEXES |
|  0 1 2 3 4  |  5 6 7 8  | ----------- | ------- |
| first index | last index| ----------- | ------- |
*/
const header = reader => {
  const first = reader.readUIntLE(0, 4);
  const last = reader.readUIntLE(4, 4);
  return { first, last };
};

const middle = (b, e, l = IP_RECORD_LENGTH) => {
  var r = (((e - b) / l) >> 1) * l + b;
  return r ^ b ? r : r + l;
};

const searchIndex = reader => {
  const { first, last } = header(reader);
  return n => {
    var b, e, m, v;
    for (b = first, e = last; b < e;) {
      m = middle(b, e);
      v = reader.readUIntLE(m, 4);
      if (n > v) {
        b = m;
      } else if (n < v) {
        if (m == e) {
          m -= IP_RECORD_LENGTH;
          break;
        }
        e = m;
      } else {
        break;
      }
    }
    return m;
  };
};

const location = reader => {
  var p2, result = [];
  return function read(n) {
    do {
      const mode = reader.readUIntLE(n, 1);
      switch (mode) {
        case 0:
          n++;
          continue;
        case REDIRECT_MODE_2:
          p2 = n + 4;
        case REDIRECT_MODE_1:
          debug('redirect:', mode);
          n = reader.readUIntLE(n + 1, 3);
          continue;
      }
      const x = reader.getStringByteArray(n);
      result.push(decode(x));
      n += x.length;
      if (p2) {
        n = p2;
        p2 = null;
      }
    } while (result.length < 2);
    return result;
  };
};

const lookup = reader => {
  return ip => {
    const n = ip2long(ip);
    const index = searchIndex(reader)(n);
    const offset = reader.readUIntLE(index + 4, 3);
    const begip = long2ip(reader.readUIntLE(index, 4));
    const endip = long2ip(reader.readUIntLE(offset, 4));
    debug(begip, endip);
    return location(reader)(offset + 4);
  };
};

const version = reader => {
  const { last } = header(reader);
  const offset = reader.readUIntLE(last + 4, 3);
  return location(reader)(offset + 4);
};

/**
 * http://staff.ustc.edu.cn/~ypb/exp/qqwry.pdf
 */
function qqwry(options = __dirname + '/qqwry.dat') {
  if (typeof options === 'string')
    options = fs.readFileSync(options);
  const reader = createReader(options);
  return {
    lookup: lookup(reader),
    version: version(reader),
    searchIndex: searchIndex(reader),
  };
};

qqwry.lookup = lookup;
qqwry.ip2long = ip2long;
qqwry.long2ip = long2ip;
qqwry.location = location;
qqwry.searchIndex = searchIndex;
qqwry.createReader = createReader;

module.exports = qqwry;