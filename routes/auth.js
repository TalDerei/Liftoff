const express = require('express');
const passport = require('passport');
const passportJwt = require('passport-jwt');
const jwt = require('jsonwebtoken');
const google = require('googleapis').google;

const router = express.Router();

// Define the JWT options:
const JWT_OPTS = {
	jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
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
	return done(null, payload);
}));

// Define a route for obtaining the OAuth ID:
router.get('/oauth-id', function(req, res) {
	res.status(200).send(OAUTH_OPTS.clientId);
});

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

			// Return a signed JWT with the user's information:
			const jwtToken = jwt.sign({
				id: userInfo.data.id,
				email: userInfo.data.email,
				name: userInfo.data.name
			}, JWT_OPTS.secretOrKey);
			res.send(JSON.stringify({ token: jwtToken }));
		});
	}).catch(function(error) {
		// Something went wrong:
		console.error('Error processing tokens');
		console.error(error);
		res.status(500).send('ERROR: Failed to process token');
	});
});

module.exports = router;

