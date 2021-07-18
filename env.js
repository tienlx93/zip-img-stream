var path = require('path');

const ROOT_DIR = process.env.ROOT_DIR || path.join(__dirname, './public/zip');
const THUMB_DIR = process.env.THUMB_DIR || path.join(__dirname, './thumb');


module.exports = {
  ROOT_DIR,
  THUMB_DIR,
}