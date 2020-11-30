/* routes associated with group */

const express = require('express');
const router = express.Router();

// Import the Postgres database:
require('../utils/postgres').then(pool => {
	// POST /users -- create new group in database
	router.post('/', (req, res) => {
		let data = req.body;
		if (data.groupname && data.grouptitle) {
			pool.query('INSERT INTO groups(groupname,grouptitle) VALUES($1,$2) RETURNING *', [data.groupname, data.grouptitle], (err, result) => {
				if (err) {
					return res.status(500).send(err);
				}
				return res.status(202).json(result.rows[0]);
			});
		}
	});

	// PUT /groups/[groupname] -- update group in database associated with groupname
	router.put('/:groupname', (req, res) => {
		let data = req.body;
		let groupname = req.params.groupname;
		if (data.groupname && data.grouptitle) {
			pool.query('UPDATE groups SET groupname=$1,grouptitle=$2, WHERE groupname = $3 RETURNING *', [data.groupname, data.grouptitle,groupname], (err, result) => {
				if (err) {
					return res.status(500).send(err);
				}
				return res.status(200).json(result.rows[0]);
			});
		}
	});

	// GET /groups/[groupname] -- get group in database associated with groupname
	router.get('/:groupname', (req, res, next) => {
		let groupname = req.params.groupname;
		pool.query('SELECT * FROM groups WHERE groupname = $1', [groupname], (err, result) => {
			if (err) {
				return res.status(500).send(err);
			}
			return res.status(200).json(result.rows[0]);
		});
	});

	// DELETE /groups/[groupname] -- delete group in database associated with groupname
	router.delete('/:groupname', (req, res) => {
		let groupname = req.params.groupname;
		pool.query('DELETE FROM groups WHERE groupname = $1', [groupname], (err, result) => {
			if (err) {
				return res.status(500).send(err);
			}
			return res.status(200).send();
		});
	});
});

module.exports = router;
