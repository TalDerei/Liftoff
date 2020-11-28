#!/usr/bin/env node

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

// Setup the express app:
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Import the authentication mechanism:
const passport = require('./routes/auth.js')(app);

// Setup static hosting for ./web:
app.use('/', express.static(path.join(__dirname, 'web')));

// Launch the app:
const PORT = process.env['PORT'] || 8080;
app.listen(PORT, function() {
	console.log('Listening on port ' + PORT);
});

