const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const faker = require('faker');
const {Story} = require('../models');
const {TEST_DATABASE_URL} = require('../config');

const should = chai.should();

const {app, runServer, closeServer} = require('../server');

chai.use(chaiHttp);

function seedData() {
  console.info('Seeding data');
  const seedData = [];
  for (var i = 0; i < 20; i += 1) {
    seedData.push(generateStoriesData());
  }
  return Story.insertMany(seedData);
}

function generateStoriesData() {
  return {
    title: faker.lorem.sentence(),
    url: faker.internet.url(),
    author: faker.name.findName()
  }
};

function tearDownDb() {
    console.info('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('Hacker News API', function() {
    before(function() {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function() {
        return seedData();
    });

    afterEach(function() {
        return tearDownDb();
    });

    after(function() {
        return closeServer();
    });

    // GET requests on /stories endpoint
    describe('GET request endpoint', function() {
      // make get request
      // check response
      // fetch data from db
      // check response object matches data in db
      let res;
      it('should return all stories', function() {
        return chai.request(app)
        .get('/stories')
        .then(_res => {
          res = _res;
          res.should.have.status(200);
          res.body.stories.should.be.a('array');
          res.body.stories.should.have.length.of.at.least(1);
          return Story.count();
        })
        .then(function(count) {
          res.body.stories.should.have.length.of(count);
        });
      });



    });

    describe('POST request endpoint', function() {
      it('should add a new story', function() {
        const newStory = generateStoriesData();

        return chai.request(app)
        .post('/stories')
        .send(newStory)
        .then(function(res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys('id', 'title', 'url', 'votes');
          res.body.id.should.not.be.null;
          res.body.title.should.equal(newStory.title);
          res.body.url.should.equal(newStory.url);
          return Story.findById(res.body.id);
        })
        .then(function(story) {
          story.title.should.equal(newStory.title);
          story.url.should.equal(newStory.url);
        })
      })
    })
});
