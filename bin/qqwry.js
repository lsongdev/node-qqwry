#!/usr/bin/env node

const { join } = require('path');
const { isIPv4 } = require('net');
const { lookup } = require('dns').promises;
const qqwry = require('..');
const package = require('../package');
const {
  getVersion,
  getQQwry,
  decode,
  unzip,
  readStream,
  writeStream
} = require('../update');

const [command, ...args] = process.argv.slice(2);

const commands = {
  async lookup(ip) {
    if (!isIPv4(ip)) {
      const { address } = await lookup(ip);
      ip = address;
    }
    console.log(this.lookup(ip).join(' '));
  },
  version() {
    return console.log(this.version);
  },
  async update(filename) {
    console.log(filename);
    const { key, version } = await getVersion();
    console.log(version);
    Promise
      .resolve(filename)
      .then(getQQwry)
      .then(decode(key))
      .then(unzip)
      .then(writeStream(join(__dirname, '../qqwry.dat')))
      .then(readStream)
      .then(console.log)
  },
  help() {
    console.log();
    console.log(` ${package.name}@${package.version}`);
    console.log();
    console.log(` - lookup [ip]`);
    console.log(` - update`);
    console.log(` - version`);
    console.log(` - help`);
  }
};

(commands[command] || commands.help).apply(qqwry(), args);