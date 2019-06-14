const { getVersion, getQQwry, decode, unzip, readStream, writeStream } = require('../update');

(async () => {

    const { key, version } = await getVersion();

    console.log(version);
    
    Promise
    .resolve()
    .then(getQQwry)
    .then(decode(key))
    .then(unzip)
    .then(writeStream('qqwry.dat'))
    // .then(readStream)
    // .then(console.log)

})();