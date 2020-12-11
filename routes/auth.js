const express = require('express');
const passport = require('passport');
const passportJwt = require('passport-jwt');
const jwt = require('jsonwebtoken');
const google = require('googleapis').google;
const pool = require('../utils/postgres');

const router = express.Router();

// Define the JWT options:
const JWT_OPTS = {
	jwtFromRequest: passportJwt.ExtractJwt.fromExtractors([
		// Define a method to extract the login token from the 'jwt' cookie, but fall back to the auth header if no cookies are found:
		function(req) {
			if(req && req.cookies)
				return req.cookies['jwt'];
		},
		passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken()
	]),
	secretOrKey: process.env['JWT_SECRET'].replace(/\s/g, '')
};

// Define the OAuth Options:
const OAUTH_OPTS = {
	clientId: process.env['GOOGLE_OAUTH_CLIENT_ID'].replace(/\s/g, ''),
	clientSecret: process.env['GOOGLE_OAUTH_CLIENT_SECRET'].replace(/\s/g, ''),
	serviceDomain: process.env['GOOGLE_OAUTH_SERVICE_DOMAIN'].replace(/\s/g, '')
};

// Setup the new JWT strategy:
passport.use(new passportJwt.Strategy(JWT_OPTS, function(payload, done) {
	done(null, payload);
}));

// Define the authentication route:
router.get('/google', function(req, res) {
	// Define the Oauth2 Client:
	const oauth2Client = new google.auth.OAuth2(
		OAUTH_OPTS.clientId,
		OAUTH_OPTS.clientSecret,
		OAUTH_OPTS.serviceDomain
	);

	// Extract the tokens using the auth code:
	const  code = req.query.code;
	const tokens = oauth2Client.getToken(code).then(function(tokens) {
		oauth2Client.setCredentials(tokens.tokens);
		const oauth2 = google.oauth2({
			auth: oauth2Client,
			version: 'v2'
		});
		oauth2.userinfo.get(function(err, userInfo) {
			if (err) {
				console.log(err);
				return res.status(500).send('ERROR: Failed to validate user information');
			}

			// Query the users table to find the user in question:
			pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [ userInfo.data.email ], (err, result) => {
				// If the user is not found, return an error:
				if(result.rowCount !== 1)
					return res.status(404).send(`Could not find user with email ${userInfo.data.email} in database`);

				// Construct a signed JWT with the user's information:
				const jwtToken = jwt.sign({
					email: userInfo.data.email,
					realname: result.rows[0].realname,
					username: result.rows[0].username
				}, JWT_OPTS.secretOrKey, {
					expiresIn: "4d"
				});

				// Return a signed JWT with the user's information:
				res.cookie('jwt', jwtToken, {
					maxAge: 3 * 24 * 60 * 60 * 1000, // expire in 3 days
					sameSite: true
				});
				res.sendStatus(200);
			});
		});
	}).catch(function(error) {
		// Something went wrong:
		console.error('Error processing tokens');
		console.error(error);
		res.status(500).send('ERROR: Failed to process token');
	});
});

// Define a route for obtaining the OAuth ID:
router.get('/oauth-id', function(req, res) {
	res.status(200).send(OAUTH_OPTS.clientId);
});

// Declare authentication middleware:
router.use(passport.authenticate('jwt', { session: false }));

// Define a route for obtaining the OAuth ID:
router.get('/whoami', function(req, res) {
	res.status(200).send({ username: req.user.username });
});

module.exports = router;

