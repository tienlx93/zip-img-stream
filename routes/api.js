const express = require('express');
const StreamZip = require('node-stream-zip');
const glob = require("glob");
const walk = require("walk");
const fs = require("fs");
const path = require("path");
const sharp = require('sharp');

const { ROOT_DIR, THUMB_DIR } = require('../env');

const router = express.Router();

// const LOCATION = `G:\\Books\\J K Rowling - Harry Potter 1-7 Unabridged Audiobooks Narrated by Stephen Fry\\3 HARRY POTTER AND THE PRISONER OF AZKABAN\\Galleries`;
const LOCATION = ROOT_DIR;
const DEFAULT_THUMB = path.join(__dirname, '../public/images/Who.png');

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
    if (!fs.existsSync(zipFile)) {
      console.error(`Not found ${zipFile}`);
      return res.status(404).end('Not found');
    }
    console.error(`Forbidden ${zipFile}`);
    return res.status(403).end('Forbidden');
  }
});

router.get('/get-zip-content', async function (req, res, next) {
  console.log('Request zip file: ' + JSON.stringify(req.query));
  var filename = req.query.filename;
  var zipname = req.query.zipname;
  var zipFile = path.join(LOCATION, filename);
  console.log('Read zip file: ' + JSON.stringify(zipFile));
  if (fs.existsSync(zipFile) && zipFile.startsWith(LOCATION)) {
    var zip;
    try {
      const zip = new StreamZip.async({ file: zipFile });
      console.log('Read zip content: ' + zipname);
      const stm = await zip.stream(zipname);
      var thumbLocation = path.join(path.join(THUMB_DIR, filename), zipname);
      var thumbfolder = path.join(path.join(THUMB_DIR, filename), 'folder.jpg');
      if (!fs.existsSync(thumbLocation)) {
        const createThumbnail =
          sharp({
            failOnError: false
          })
            .resize(200)
            .jpeg();
        const folderLoc = path.join(THUMB_DIR, filename);
        console.log({thumbLocation, folderLoc})
        if (!fs.existsSync(folderLoc))
          fs.mkdir(folderLoc, { recursive: true }, (err) => {
            if (err) throw err;
          });
        const promises = [];
        promises.push(
          createThumbnail
            .clone()
            .toFile(thumbLocation)
        );
        if (!fs.existsSync(thumbfolder)) {
          promises.push(
            createThumbnail
              .clone()
              .toFile(thumbfolder)
          );
        }
        stm
          .pipe(createThumbnail)
          .on('error', (e) => {
            console.error(e);
          });
        Promise.all(promises)
        .then(res => { console.log("Done!", res); })
        .catch(err => {
          console.error("Error processing files, let's clean it up", err);
          try {
            fs.unlinkSync(thumbfolder);
            fs.unlinkSync(thumbLocation);
          } catch (e) {
            console.error("Error ", e);
          }
        });
      }
      stm.pipe(res);
    } catch (e) {
      res.status(500).json({error: e});
    } finally {
      if (zip)
        await zip.close();
    }
  } else {
    if (!fs.existsSync(zipFile)) {
      console.error(`Not found ${zipFile}`);
      return res.status(404).end('Not found');
    }
    console.error(`Forbidden ${zipFile}`);
    return res.status(403).end('Forbidden');
  }
});

router.get('/get-thumb', async function (req, res, next) {
  console.log('Request thumb file: ' + JSON.stringify(req.query));
  var filename = req.query.filename;
  var thumbname = req.query.thumbname;
  var thumbLocation = path.join(path.join(THUMB_DIR, filename), thumbname);
  if (thumbLocation.startsWith(THUMB_DIR)) {
    console.log('thumbLocation: ' + thumbLocation);
    var s = fs.createReadStream(thumbLocation);
    s.on('open', function () {
        res.set('Content-Type', 'image/jpeg');
        s.pipe(res);
    });
    s.on('error', function () {
        console.log('thumbLocation not found, get DEFAULT_THUMB: ' + DEFAULT_THUMB);
        var s2 = fs.createReadStream(DEFAULT_THUMB);
        s2.on('open', function () {
          res.set('Content-Type', 'image/png');
          s2.pipe(res);
        });
        s2.on('error', function () {
          res.set('Content-Type', 'text/plain');
          res.status(404).end('Not found');
        });
    });
  } else {
    console.error(`Forbidden ${zipFile}`);
    return res.status(403).end('Forbidden');
  }
});

module.exports = router;
