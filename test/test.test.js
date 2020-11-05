
const app = require('../server/index.js');
const request = require('supertest')

describe('GET /checkAuthorization', () => {
    it("check connection", async() => {
        let result = await request(app)
            .get('/v1/check')
            .expect(404)
           
    });
    it("should not authorize the user", async() => {
        let result = await request(app)
            .get('/v1/user/')
            .set('Authorization', 'Basic '+new Buffer.from("test@test.com:Test@1234"))
            .expect(401)
            .done
        if(!result) return false;
    });
});