var request = require("request");

var base_url = "http://localhost:3000/users"

let User = {
  _id:1,
  name:'',
  email:'',
  password:''
};
//Object.defineProperty(User, "_id", {});
//Object.defineProperty(User, "name", {});
//Object.defineProperty(User, "email", {});
//Object.defineProperty(User, "password", {});

describe("Users List API Exists", function() {
  describe("GET /users", function() {
    it("returns status code 200", function(done) {
      request.get(base_url, function(error, response, body) {
        expect(response.statusCode).toBe(200);
        done();
      });
    });

    /*it("should be valid array", function(done) {
      request.get(base_url, function(error, response, body) {
        expect(body instanceof Array).toBeTruthy();
        done();
      });
    });*/

    it("API Response should be valid array of json objects 1", function(done) {
      request.get(base_url, function(error, response, body) {
        // console.log(typeof body);
        //  body = 'Hello World';
        expect(() => {
          JSON.parse(body);
        }).not.toThrow();

        done();
      });
    });

    it("API Response should be valid array of user objects 2", function(done) {
      request.get(base_url, function(error, response, body) {
        let users = JSON.parse(body);
        const userRows = users.map((userRow) => {
          expect(JSON.stringify(Object.keys(User).sort()) === JSON.stringify(Object.keys(userRow).sort())).toBeTruthy();
        });
        done();
      });
    });

  });
});