const request = require('supertest');
const app = require('../server/index.js');


describe('GET check server', () => {
    
    it("checking server is online or not", async() => {
        jest.setTimeout(3000);
        let result = await request(app)
            .get('/check')
            //.set('Authorization', 'Basic '+new Buffer.from("test@test.com:Test@1234").toString("base64"))
            .expect(200)
    
    });
});

