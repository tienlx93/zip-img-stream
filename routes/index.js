var express = require('express');
var router = express.Router();
const fetch = require("node-fetch");

/* GET home page. */
router.get('/', async function(req, res, next) {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const baseUrl = req ? `${protocol}://${req.headers.host}` : '';
  const respone = await fetch(`${baseUrl}/api/dir`);
  const fileList = await respone.json();
  res.render('index', { title: 'Express' , fileList});
});

router.get('/detail/:filename(*)', async function(req, res, next) {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const baseUrl = req ? `${protocol}://${req.headers.host}` : '';
  console.log(`Requesting GET /detail/:filename(*), params: ${JSON.stringify(req.params)}`)
  const filename = req.params.filename;
  console.log({filename})
  try {
    const respone = await fetch(`${baseUrl}/api/zip?filename=${filename}`);
    const fileList = await respone.json();
    res.render('detail', { title: 'Express' , fileList, zipFileName: filename});
  } catch (error) {
    res.render('error', error)
  }
  
});

module.exports = router;
