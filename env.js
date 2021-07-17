var path = require('path');

const ROOT_DIR = process.env.ROOT_DIR || path.join(__dirname, './public/zip');

module.exports = {
  ROOT_DIR
}