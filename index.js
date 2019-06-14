const fs = require('fs');
const path = require('path');
const { debuglog } = require('util');
const { decode } = require('fast-gbk');

const debug = debuglog('qqwry');

const REDIRECT_MODE_1 = 1;
const REDIRECT_MODE_2 = 2;
const IP_RECORD_LENGTH = 7;
const IP_LENGTH = 4;
const SKIP_IP_LENGTH = IP_LENGTH;

const ip2long = ip =>
  ip.split('.').reduce((n, p) => (n << 8) + parseInt(p), 0) >>> 0;

const long2ip = n =>
  [0, 0, 0, 0].map((_, i) => (n >>> (i * 8)) & 0xff).reverse().join('.')

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

const readIP = reader => {
  return index => {
    return long2ip(reader.readUIntLE(index, IP_LENGTH));
  }
}

const searchIndex = reader => {
  const { first, last } = header(reader);
  return ip => {
    var b, e, m, v, n = ip2long(ip);
    for (b = first, e = last; b < e;) {
      m = middle(b, e);
      v = reader.readUIntLE(m, IP_LENGTH);
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
    return {
      ip: readIP(reader)(m),
      offset: reader.readUIntLE(m + SKIP_IP_LENGTH, 3)
    };
  };
};

const readRecord = reader => {
  return index => {
    const ip = readIP(reader)(index);
    const offset = index + SKIP_IP_LENGTH;
    const value = location(reader)(offset);
    return { ip, offset, value };
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
          p2 = n + SKIP_IP_LENGTH;
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
    const index = searchIndex(reader)(ip);
    const record = readRecord(reader)(index.offset);
    debug(ip, index.ip, record.ip);
    return record.value;
  };
};

const version = reader => {
  const { last } = header(reader);
  const offset = reader.readUIntLE(last + SKIP_IP_LENGTH, 3);
  return readRecord(reader)(offset).value;
};

/**
 * http://staff.ustc.edu.cn/~ypb/exp/qqwry.pdf
 */
function qqwry(options = path.join(__dirname, 'qqwry.dat')) {
  if (typeof options === 'string')
    options = fs.readFileSync(options);
  const reader = createReader(options);
  return {
    lookup: lookup(reader),
    version: version(reader),
    readRecord: readRecord(reader),
    searchIndex: searchIndex(reader),
  };
};

qqwry.lookup = lookup;
qqwry.version = version;
qqwry.ip2long = ip2long;
qqwry.long2ip = long2ip;
qqwry.location = location;
qqwry.readRecord = readRecord;
qqwry.searchIndex = searchIndex;
qqwry.createReader = createReader;

module.exports = qqwry;