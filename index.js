/* index.js is entry point for server */ 

const express = require('express');
const bodyParser = require('body-parser')

// routes
var usersRouter = require('./routes/users');
var groupsRouter = require('./routes/groups')

// setting-up server instance with express
var app = express();

// set network port
app.set('port', process.env.PORT || 3000);

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true,}));

// routes
app.use('/users', usersRouter);
app.use('/groups', groupsRouter)

app.listen(3000, function () {
	console.log('Server is running.. on Port 3000');
});

module.exports = app;
