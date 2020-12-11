/* routes associated with users */

const express = require('express');
const passport = require('passport');
const pool = require('../utils/postgres');
const router = express.Router();

// GET /users/[username] -- get user in database associated with username
router.get('/:username', (req, res, next) => {
	let username = req.params.username;
	pool.query('SELECT * FROM users WHERE username = $1', [username], (err, result) => {
		if (err) {
			console.error('Error in GET /api/users:', err);
			return res.status(500).send(err);
		}
		return res.status(200).json(result.rows[0]);
	});
});

// Declare authentication middleware:
router.use(passport.authenticate('jwt', { session: false }));

// POST /users -- create new user in database
router.post('/', (req, res) => {
	let data = req.body;
	if (data.username && data.email && data.realname) {
		pool.query('INSERT INTO users(username,email,realname) VALUES($1,$2,$3) RETURNING *', [data.username, data.email, data.realname], (err, result) => {
			if (err) {
				if(err.code === '23505') {
					return res.status(409).send(err.detail);
				}
				console.error('Error in POST /api/users:', err);
				return res.status(500).send(err);
			}
			return res.status(202).json(result.rows[0]);
		});
	} else {
		return res.status(400).send('ERROR: "username", "email", and "realname" fields must be included in request');
	}
});

// PUT /users/[username] -- update user in database associated with username
router.put('/:username', (req, res) => {
	// Make sure that only the user in question can update themselves:
	if(req.user.username !== req.params.username)
		return res.status(403).send('ERROR: Modification to others\' accounts is forbidden');

	// Run the query:
	let data = req.body;
	let username = req.params.username;
	if (data.email && data.realname) {
		pool.query('INSERT INTO users(username,email,realname) VALUES($1,$2,$3) ON CONFLICT ON CONSTRAINT users_pkey DO UPDATE SET email=EXCLUDED.email,realname=EXCLUDED.realname RETURNING *', [username, data.email, data.realname], (err, result) => {
			if (err) {
				console.error('Error in PUT /api/users:', err);
				return res.status(500).send(err);
			}
			return res.status(200).json(result.rows[0]);
		});
	} else {
		return res.status(400).send('ERROR: "username", "email", and "realname" fields must be included in request');
	}
});

// DELETE /users/[username] -- delete user in database associated with username
router.delete('/:username', (req, res) => {
	// Make sure that only the user in question can update themselves:
	if(req.user.username !== req.params.username)
		return res.status(403).send('ERROR: Modification to others\' accounts is forbidden');

	// Run the query:
	let username = req.params.username;
	pool.query('DELETE FROM users WHERE username = $1', [username], (err, result) => {
		if (err) {
			console.error('Error in DELETE /api/users:', err);
			return res.status(500).send(err);
		}
		if(result.rowCount === 0) {
			return res.status(404).send(`ERROR: user '${username}' not found`);
		}
		return res.status(200).send();
	});
});

module.exports = router;

