const qqwry = require('..');
const assert = require('assert');

const { lookup, version, searchIndex } = qqwry();

assert.equal(version[0], '纯真网络');

;[
  ['115.193.152.250', '浙江省杭州市', '电信'],
  ['60.13.250.0', '新疆克拉玛依市', '联通'],
  ['117.25.128.84', '福建省厦门市', '电信IDC机房'],
  ['222.73.68.35', '上海市', '电信'],
  ['203.198.23.69', '香港', '电讯盈科有限公司'],
  ['221.223.102.183', '北京市朝阳区', '联通'],
  ['211.66.210.249', '广东省广州市', '广州市教育局'],
  ['8.8.8.8', '美国', '加利福尼亚州圣克拉拉县山景市谷歌公司DNS服务器'],
  ['114.114.114.114', '江苏省南京市', '南京信风网络科技有限公司GreatbitDNS服务器'],
  ['123.125.114.144', '北京市', '北京百度网讯科技有限公司联通节点'],
].forEach(([ip, country, area]) => {
  assert.deepEqual(lookup(ip), [country, area]);
});

assert.equal(qqwry.ip2long('127.0.0.1'), 2130706433);
assert.equal(qqwry.ip2long('192.168.88.1'), 3232258049);
assert.equal(qqwry.long2ip(2130706433), '127.0.0.1');
assert.equal(qqwry.long2ip(3232258049), '192.168.88.1');

assert.equal(searchIndex('8.8.8.8').ip, '8.8.8.8');