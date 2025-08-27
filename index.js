require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

let urls = [];
let id = 1;

app.post('/api/shorturl', (req, res) => {
  const url = req.body.url;

  if (!/^https?:\/\/.+/i.test(url)) {
    return res.json({ error: 'invalid url' });
  }

  let hostname;
  try {
    hostname = new URL(url).hostname;
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    } else {
      urls.push({ original_url: url, short_url: id });
      res.json({ original_url: url, short_url: id });
      id++;
    }
  });
});

app.get('/api/shorturl/:id', (req, res) => {
  const shortUrl = parseInt(req.params.id);
  const found = urls.find(u => u.short_url === shortUrl);

  if (found) {
    res.redirect(found.original_url);
  } else {
    res.json({ error: 'No short URL found for given input' });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
