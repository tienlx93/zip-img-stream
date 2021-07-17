var path = require('path');

const ROOT_DIR = process.env.ROOT_DIR || path.join(__dirname, './public/zip');
console.log(ROOT_DIR);

module.exports = {
  ROOT_DIR
}