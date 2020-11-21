const express = require('express');
const {Client} = require('pg');
const connectionString = 'postgres://azexrkxulzlqss:b12fcddc21a71c8cc0b04de34d8ab4bc99a726bdb0b2e455b63865e0cdbb3442@ec2-3-234-109-123.compute-1.amazonaws.com:5432/d9aki869as2d5b';

// initalize database object 'Client'
const client = new Client ({
    connectionString: connectionString
});

// establish a connection with database object
client.connect();

// setting-up server instance with express
var app = express();

// set network port
app.set('port', process.env.PORT || 4000);

// app.get('/', function(req, res, next) 

app.listen(4000, function () {
    console.log('Server is running.. on Port 4000');
});
