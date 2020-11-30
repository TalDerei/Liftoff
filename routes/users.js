/* routes associated with users */

const express = require('express');
const pool = require('../utils/postgres');
const router = express.Router();

// POST /users -- create new user in database
router.post('/', (req, res) => {
	let data = req.body;
	if (data.username && data.email && data.realname) {
		pool.query('INSERT INTO users(username,email,realname) VALUES($1,$2,$3) RETURNING *', [data.username, data.email, data.realname], (err, result) => {
			if (err) {
				return res.status(500).send(err);
			}
			return res.status(202).json(result.rows[0]);
		});
	}
});

// PUT /users/[username] -- update user in database associated with username
router.put('/:username', (req, res) => {
	let data = req.body;
	let username = req.params.username;
	if (data.email && data.realname) {
		pool.query('UPDATE users SET email=$1,realname=$2, WHERE username = $3 RETURNING *', [data.email, data.realname, username], (err, result) => {
			if (err) {
				return res.status(500).send(err);
			}
			return res.status(200).json(result.rows[0]);
		});
	}
});

// GET /users/[username] -- get user in database associated with username
router.get('/:username', (req, res, next) => {
	let username = req.params.username;
	pool.query('SELECT * FROM users WHERE username = $1', [username], (err, result) => {
		if (err) {
			return res.status(500).send(err);
		}
		return res.status(200).json(result.rows[0]);
	});
});

// DELETE /users/[username] -- delete user in database associated with username
router.delete('/:username', (req, res) => {
	let username = req.params.username;
	pool.query('DELETE FROM users WHERE username = $1', [username], (err, result) => {
		if (err) {
			return res.status(500).send(err);
		}
		return res.status(200).send();
	});
});

module.exports = router;

