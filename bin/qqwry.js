#!/usr/bin/env node

const qqery = require('..');
const package = require('../package');

const [command, ...args] = process.argv.slice(2);

const commands = {
  lookup(ip) {
    console.log(this.lookup(ip));
  },
  version(){
    return console.log(this.version);
  },
  help(){
    console.log();
    console.log(` ${package.name}/${package.version}`);
    console.log();
    console.log(` - lookup [ip]`);
    console.log(` - version`);
    console.log(` - help`);
  }
};

(commands[command] || commands.help).apply(qqery(), args);