
const app = require('../server/index.js');
const request = require('supertest')

describe('GET /checkAuthorization', () => {
    it("check connection", async() => {
        let result = await request(app)
            .get('/v1/check')
            .expect(404)
           
    });
});