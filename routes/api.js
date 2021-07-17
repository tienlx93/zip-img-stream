const express = require('express');
const StreamZip = require('node-stream-zip');
const glob = require("glob");
const walk = require("walk");
const fs = require("fs");
const path = require("path");
const { ROOT_DIR } = require('../env');

const router = express.Router();

// const LOCATION = `G:\\Books\\J K Rowling - Harry Potter 1-7 Unabridged Audiobooks Narrated by Stephen Fry\\3 HARRY POTTER AND THE PRISONER OF AZKABAN\\Galleries`;
const LOCATION = ROOT_DIR;

/* GET dir. */
router.get('/dir', function (req, res, next) {
  console.log(`GET dir at LOCATION ${LOCATION}`)
  var walker = walk.walk(LOCATION, { followLinks: false });
  var ALLfiles = [];
  walker.on('file', function (root, stat, next) {
    // Add this file to the list of files
    console.log('Walk ' + stat.name);
    if (stat.name.includes('.zip')) {
      ALLfiles.push({ name: `${root.replace(LOCATION, '').replace('\\', '')}/${stat.name}`, dir: `${root}/${stat.name}` });
    }
    next();
  });

  walker.on('end', function () {
    res.json(ALLfiles);
  });
});

router.get('/zip', async function (req, res, next) {
  console.log('Request zip file: ' + JSON.stringify(req.query));
  var filename = req.query.filename;
  var zipFile = path.join(LOCATION, filename);
  console.log('Read zip file: ' + JSON.stringify(zipFile));
  if (fs.existsSync(zipFile) && zipFile.startsWith(LOCATION)) {
    var zip;
    try {
      zip = new StreamZip.async({ file: zipFile });
      const resp = []
      const entriesCount = await zip.entriesCount;
      console.log(`Entries read: ${entriesCount}`);

      const entries = await zip.entries();
      for (const entry of Object.values(entries)) {
        const desc = entry.isDirectory ? 'directory' : `${entry.size} bytes`;
        console.log(`Entry ${entry.name}: ${desc}`);
        resp.push(entry.name);
      }
      res.json(resp);
    } catch (error) {
      res.json(error);
    } finally {
      if (zip)
        await zip.close();
    }
  } else {
    console.error()
    res.json({ error: 'fs.existsSync(path)' + fs.existsSync(path) });
  }
});

router.get('/get-zip-content', async function (req, res, next) {
  console.log('Request zip file: ' + JSON.stringify(req.query));
  var filename = req.query.filename;
  var zipname = req.query.zipname;
  var zipFile = path.join(LOCATION, filename);
  console.log('Read zip file: ' + JSON.stringify(zipFile));
  if (fs.existsSync(zipFile) && zipFile.startsWith(LOCATION)) {
    var resp;
    var zip;
    try {
      const zip = new StreamZip.async({ file: zipFile });
      console.log('Read zip content: ' + zipname);
      const stm = await zip.stream(zipname);
      stm.pipe(res);
    } catch (e) {
      res.json({ error: e });
    } finally {
      if (zip)
        await zip.close();
    }
  } else {
    console.error()
    res.json({ error: 'fs.existsSync(path)' + fs.existsSync(path) });
  }
});

module.exports = router;
