# webapp.
# Repo for CSYE6225-Fall2020

# Requirements..
1)You must have node and package manager(npm/yarn) installed to run this application
	
 a) https://nodejs.org/en/download/ <br />
 b) Linux- [sudo] npm install npm -g
 
 
# Clone this repo
```
a) $ https://github.com/davebhavin9/webapp.git <br />
b) $ cd webapp <br />
c) $ npm install <br />

```
# Running the server
1) connect to database
```
$ npm run build
```

# Routes to use the app
Reference- https://app.swaggerhub.com/apis-docs/csye6225/fall2020-csye6225/assignment-05#/public/get_v1_user__id_

http://localhost:{PORT_ID}/ +
```
1) GET /v1/user/self
2) PUT /v1/user/self
3) POST /v1/question/
4) POST /v1/question/{question_id}/answer
5) PUT /v1/question/{question_id}/answer/{answer_id}
6) DELETE /v1/question/{question_id}/answer/{answer_id}
7) DELETE /v1/question/{question_id}
8) PUT /v1/question/{question_id}
9) POST /v1/user
10) GET /v1/user/{id}
11) GET /v1/question/{question_id}/answer/{answer_id}
12) GET /v1/questions
13) GET /v1/question/{question_id}
14) POST /v1/question/{question_id}/file
15) DELETE /v1​/question​/{question_id}​/file​/{file_id}
16) DELETE /v1​/question​/{question_id}​/answer​/{answer_id}​/file​/{file_id}
17) POST ​/v1​/question​/{question_id}​/answer​/{answer_id}​/file
```
