const request = require('supertest');
const app = require('../server/index');


describe('GET /checkAuthorization', () => {
    it("should authorize the user", async() => {
        let result = await request(app)
            .get('/v1/user/checkAuthorization')
            .set('Authorization', 'Basic '+new Buffer.from("test@test.com:Test@1234").toString("base64"))
            .expect(200)
        if(!result) return false;
    });

    it("should not authorize the user", async() => {
        let result = await request(app)
            .get('/v1/user/checkAuthorization')
            .set('Authorization', 'Basic '+new Buffer.from("test@test.com:Test@1234"))
            .expect(401)
        if(!result) return false;
    });
});