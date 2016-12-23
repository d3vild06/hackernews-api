const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {Story} = require('./models');
const {DATABASE_URL, PORT} = require('./config');

mongoose.Promise = global.Promise;

// const DATABASE_URL = process.env.DATABASE_URL ||
//                      global.DATABASE_URL ||
//                      'mongodb://localhost/hn-api';
// const PORT = process.env.PORT || 8080;

const app = express();
app.use(bodyParser.json());

// API endpoints go here
app.get('/stories', (req, res) => {
  Story.find().limit(20).exec().then(function(stories) {
    res.status(200).json({
      stories: stories.map(
        (story) => story.apiRepr())
    });
  })
  .catch(err => {
    return res.status(500).json({message: 'Internal Server Error'});
  });
});

app.post('/stories', (req, res) => {
  const requiredFields = ['title', 'url'];
  requiredFields.forEach(field => {
    if (!(field in req.body && req.body[field])) {
      return res.status(400).json({message: `Must specify value for ${field}`});
    }
  });
  Story.create({
    title: req.body.title,
    url: req.body.url
  })
  .then(
    story => res.status(201).json(story.apiRepr()))
  .catch(err => {
    res.status(500).json({message: 'Internal Server Error'});
  });
});



let server;
function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};
