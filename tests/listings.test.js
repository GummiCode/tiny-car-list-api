const { expect } = require('chai');
const request = require('supertest');
const { Listing } = require('../src/models');
const app = require('../src/app');

const mock1 = {
  make: 'coffeeshop',
  model: 'matcha',
  year: 2010,
  city: 'liverpool',
  email: 'latte@mock.com',
};

const mock6 = [
  {
    make: 'chroma',
    model: 'chartreuse',
    year: 2011,
    city: 'sheffield',
    email: 'mapplefordd@imdb.com',
  },
  {
    make: 'kawaii',
    model: 'panda',
    year: 2013,
    city: 'sheffield',
    email: 'aaugustus1j@aol.com',
  },
  {
    make: 'vista',
    model: 'reykjavik',
    year: 1996,
    city: 'leeds',
    email: 'kbeertv@weather.com',
  },
  {
    make: 'stansa',
    model: 'ska',
    year: 2005,
    city: 'london',
    email: 'cmacquire2m@biglobe.ne.jp',
  },
  {
    make: 'rockstone',
    model: 'peridot',
    year: 2012,
    city: 'sheffield',
    email: 'chaestier2i@istockphoto.com',
  },
  {
    make: 'vista',
    model: 'lisbon',
    year: 2004,
    city: 'leicester',
    email: 'egluyusm@msu.edu',
  },
];

describe('/listing', () => {
  before(async () => {
    try {
      await Listing.sequelize.sync();
    } catch (err) {
      console.log(err);
    }
  });

  beforeEach(async () => {
    try {
      await Listing.destroy({ where: {} });
    } catch (err) {
      console.log(err);
    }
  });

  describe('POST /listing', () => {
    it('creates a new listing in the tinycarindex database', async () => {
      const response = await request(app).post('/listing').send(mock1);

      expect(response.status).to.equal(201);
      expect(response.body.make).to.equal('coffeeshop');
      expect(response.body.model).to.equal('matcha');
      expect(response.body.year).to.equal(2010);
      expect(response.body.city).to.equal('liverpool');
      expect(response.body.email).to.equal('latte@mock.com');

      const insertedListing = await Listing.findByPk(response.body.id, { raw: true });
      expect(insertedListing.make).to.equal('coffeeshop');
      expect(insertedListing.model).to.equal('matcha');
      expect(insertedListing.year).to.equal(2010);
      expect(insertedListing.city).to.equal('liverpool');
      expect(insertedListing.email).to.equal('latte@mock.com');
    });
  });

  describe('with listings in the tinycarindex database', () => {
    let listings;

    beforeEach(async () => {
      listings = await Promise.all(
        mock6.map((listing) => Listing.create(listing)),
      );
    });

    describe('GET /listing', () => {
      it('gets all listings if no query is provided', async () => {
        const res = await request(app).get('/listing');
        expect(res.status).to.equal(200);
        expect(res.body.length).to.equal(6);
        res.body.forEach((listing) => {
          const expected = listings.find((l) => l.id === listing.id);
          expect(listing.make).to.equal(expected.make);
          expect(listing.model).to.equal(expected.model);
          expect(listing.year).to.equal(expected.year);
          expect(listing.city).to.equal(expected.city);
          expect(listing.email).to.equal(expected.email);
        });
      });

      it('gets specified listings if queries are provided', async () => {
        const res = await request(app)
          .get('/listing')
          .query({ city: 'sheffield' });
        expect(res.status).to.equal(200);
        expect(res.body.length).to.equal(3);
        res.body.forEach((listing) => {
          const expected = listings.find((l) => l.city === listing.city);
          expect(listing.city).to.equal(expected.city);
          expect(listing.city).to.equal('sheffield');
        });
      });

      it('returns a 404 and an error message if the query does not exist', async () => {
        const res = await request(app)
          .get('/listing')
          .query({ city: 'emerald city' });
        expect(res.status).to.equal(404);
        expect(res.body.error).to.equal('Your search returned no results.');
      });
    });


    describe('PATCH /listing', () => {
      it('updates a listing by its id; model test', async () => {
        const listing = listings[0];
        const res = await request(app)
          .patch(`/listing/${listing.id}`)
          .send({ model: 'eggshell' });
        expect(res.status).to.equal(200);
        const updatedListing = await Listing.findByPk(listing.id, { raw: true });
        expect(updatedListing.make).to.equal('chroma');
        expect(updatedListing.model).to.equal('eggshell');
      });

      it('updates a listing by its id; city test', async () => {
        const listing = listings[0];
        const res = await request(app)
          .patch(`/listing/${listing.id}`)
          .send({ city: 'lamlash' });
        expect(res.status).to.equal(200);
        const updatedListing = await Listing.findByPk(listing.id, { raw: true });
        expect(updatedListing.make).to.equal('chroma');
        expect(updatedListing.city).to.equal('lamlash');
      });

      it('returns a 404 and an error message if the listing does not exist', async () => {
        const res = await request(app)
          .patch('/listing/99999')
          .send({ model: 'pineapple bun' });
        expect(res.status).to.equal(404);
        expect(res.body.error).to.equal('This listing could not be found.');
      });
    });
  });
});
