const request = require('supertest');
const app = require('../server/index.js');


describe('GET check server', () => {
    it("checking server is online or not", async() => {
        let result = await request(app)
            .get('/check')
            .expect(200)
        if(!result) return false;
    });

});

