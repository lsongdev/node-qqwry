const fs = require('fs');
const zlib = require('zlib');
const http = require('http');
const gbk = require('fast-gbk');
const QQwryDecoder = require('./decode');

const API = 'http://update.cz88.net';
const API_QQWRY = API + '/ip/qqwry.rar';
const API_COPYWRITE = API + '/ip/copywrite.rar';

const get = url => 
  new Promise(done => http.get(url, done));

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

const getQQwry = () =>
  Promise
  .resolve(API_QQWRY)
  .then(get)

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

