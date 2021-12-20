const http = require('http');
const qqwry = require('.');
const { parse } = require('url');

const { lookup } = qqwry();

const server = http.createServer((req, res) => {
  const { query } = parse(req.url, true);
  const { ip } = query;
  if (!ip) return res.end('no ip');
  const [country, address] = lookup(ip);
  res.end(JSON.stringify({ ip, country, address }));
});

server.listen(3000);