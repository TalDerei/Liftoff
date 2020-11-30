#!/usr/bin/env node

// Load dependencies:
const bodyParser = require('body-parser');
const express = require('express');
const passport = require('passport');
const path = require('path');

// Import API routes:
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const groupsRouter = require('./routes/groups')

// setting-up server instance with express
const app = express();

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
app.use('/api/groups', groupsRouter)

// Setup static hosting for ./web:
app.use('/', express.static(path.join(__dirname, 'web')));

// Launch the app:
const PORT = process.env['PORT'] || 8080;
app.listen(PORT, function() {
	console.log('Listening on port ' + PORT);
});

module.exports = app;

