## geoip-qqwry 

> A light weight native JavaScript implementation of GeoIP API

[![geoip-qqwry](https://img.shields.io/npm/v/geoip-qqwry.svg)](https://npmjs.org/geoip-qqwry)
[![Build Status](https://travis-ci.org/song940/qqwry.svg?branch=master)](https://travis-ci.org/song940/qqwry)

### Installation

```bash
$ npm i [-g] geoip-qqwry [--save]
```

### Usage

```bash
~$ qqwry
~> geoip-qqwry@0.0.3

 - lookup [ip]
 - update
 - version
 - help

~$ qqwry lookup 114.114.114.114
~> 江苏省南京市 南京信风网络科技有限公司GreatbitDNS服务器
```

### Example

```js
const qqwry = require('geoip-qqwry');

const { lookup } = qqwry();

console.log(lookup('8.8.8.8')); 
//=> [ '美国', '加利福尼亚州圣克拉拉县山景市谷歌公司DNS服务器' ]
```

### Contributing
- Fork this Repo first
- Clone your Repo
- Install dependencies by `$ npm install`
- Checkout a feature branch
- Feel free to add your features
- Make sure your features are fully tested
- Publish your local branch, Open a pull request
- Enjoy hacking <3

### MIT

This work is licensed under the [MIT license](./LICENSE).

---
