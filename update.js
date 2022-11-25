const fs = require('fs');
const zlib = require('zlib');
const https = require('https');
const gbk = require('fast-gbk');
const QQwryDecoder = require('./decode');

const API = 'https://update.cz88.net';
const API_QQWRY = API + '/ip/qqwry.rar';
const API_COPYWRITE = API + '/ip/copywrite.rar';

const get = url =>
  new Promise(done => {
    console.log(url);
    https.get(url, res => {
      if (res.statusCode === 301) {
        get(res.headers["location"]).then(done, console.error)
      } else {
        done(res);
      }
    });
  });

const version = copywrite => {
  copywrite.read(20);
  const key = copywrite.read(4).readUIntLE(0, 4);
  const version = gbk.decode(copywrite.read(128));
  return { key, version };
};

const getVersion = () =>
  Promise
    .resolve(API_COPYWRITE)
    .then(get)
    .then(version)

const getQQwry = local => {
  if (local) return fs.createReadStream(local);
  return get(API_QQWRY);
}

const decode = key =>
  res => res.pipe(new QQwryDecoder(key))

const unzip = stream =>
  stream.pipe(zlib.createInflate());

const readStream = stream => {
  const buffer = [];
  return new Promise((resolve, reject) => {
    stream
      .on('error', reject)
      .on('data', chunk => buffer.push(chunk))
      .on('end', () => resolve(Buffer.concat(buffer)))
  });
};

const writeStream = filename =>
  stream => stream.pipe(fs.createWriteStream(filename));

module.exports = {
  unzip,
  decode,
  version,
  getQQwry,
  getVersion,
  readStream,
  writeStream,
};

