#!/usr/bin/env node

// Load dependencies:
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const http = require('http');
const httpShutdown = require('http-shutdown');
const passport = require('passport');
const path = require('path');

// Import utilities:
const lightship = require('./utils/lightship');

// Create the server:
const app = express();
const server = httpShutdown(http.createServer(app));

// Register the server shutdown hook:
lightship.registerShutdownHandler(async () => {
	// Wait for all existing connections to complete, barring keep-alive connections:
	console.log('Shutting down HTTP server ...');
	await new Promise(res => {
		server.shutdown(err => {
			if(err)
				console.error('Failed to shutdown HTTP server: ', err);
			else
				console.log('HTTP server has shutdown.');
			return res();
		});
	});
});

// Load Middleware:
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true,}));
app.use(cookieParser());
app.use(passport.initialize());

// Import API routes:
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const groupsRouter = require('./routes/groups')

// set network port
app.set('port', process.env.PORT || 8080);

// Load API routes:
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/groups', groupsRouter)

// Setup static hosting for ./web:
app.use('/', express.static(path.join(__dirname, 'web')));

// Launch the app:
const PORT = process.env['PORT'] || 8080;
server.listen(PORT, function() {
	console.log('Listening on port ' + PORT);

	// Tell Kubernetes that we are now ready to process incoming HTTP requests:
	lightship.signalReady();
});

module.exports = app;

