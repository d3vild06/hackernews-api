const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const faker = require('faker');
const {Story} = require('./models');

const should = chai.should();

const {app, runServer, closeServer} = require('../server');

chai.use(chaiHttp);

function seedData() {
  console.info('Seeding data');
  const seedData = [];
  for (var i = 0; i <= 20; i += 1) {
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
        return runServer();
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
      it('should return all stories', function() {
        return chai.request(app)
        .get('/stories')
        .then(res => {
          let responseStoryId = res.body.stories[0]._id;
          let responseStoryAuthor = res.body.stories[0].author;
          let storyFromDB = Story.findById(responseStoryId);
          res.should.have.status(200);
          res.body.stories.should.be.a('array');
          storyFromDB.author.should.equal(responseStoryAuthor);
        });
      });
      

    });
});
