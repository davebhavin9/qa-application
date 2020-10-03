//REference https://gist.github.com/vladimirze/960d8c721455333a154fa1f73b412d51 , https://github.com/mhevery/jasmine-node

const request = require('request');

const server = require('../server/index');

const endpoint = 'http://localhost:8080/check';


var name = require("bhavin");

var request = require('request');

it('should return 200 response code', function (done) {
    request.get(endpoint, function (error, response) {
        expect(response.statusCode).toEqual(200);
        done();
    });
});
describe('check', function () {
    it('should return 200 response code', function (done) {
        request.get(endpoint, function (error, response) {
            expect(response.statusCode).toEqual(200);
            done();
        });
    });

    it('should fail on POST', function (done) {
        request.post(endpoint, {json: true, body: {}}, function (error, response) {
            expect(response.statusCode).toEqual(404);
            done();
        });
    });
});