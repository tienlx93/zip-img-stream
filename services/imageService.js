const sharp = require('sharp');

const createThumbnail =
  sharp()
    .resize(200)
    .jpeg();