#!/usr/bin/env node

// Load dependencies:
const bodyParser = require('body-parser');
const delay = require('delay');
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

// Import API routes:
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const groupsRouter = require('./routes/groups');
const projectsRouter = require('./routes/usersFeed');

// set network port
app.set('port', process.env.PORT || 8080);

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true,}));
app.use(passport.initialize());

// Configure route-level authentication:
usersRouter.use(passport.authenticate('jwt', { session: false }));
groupsRouter.use(passport.authenticate('jwt', { session: false }));

// Load API routes:
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/projects', projectsRouter);

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

