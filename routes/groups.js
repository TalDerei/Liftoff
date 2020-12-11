/* routes associated with group */

const express = require('express');
const pool = require('../utils/postgres');
const router = express.Router();

// POST /groups -- create new group in database
router.post('/', (req, res) => {
	let data = req.body;
	if (data.groupname && data.grouptitle) {
		pool.query('INSERT INTO groups(groupname,grouptitle) VALUES($1,$2) RETURNING *', [data.groupname, data.grouptitle], (err, result) => {
			if (err) {
				if(err.code === '23505') {
					return res.status(409).send(err.detail);
				}
				return res.status(500).send(err);
			}
			return res.status(202).json(result.rows[0]);
		});
	} else {
		return res.status(400).send('ERROR: "groupname" and "grouptitle" fields must be included in request');
	}
});

// PUT /groups/[groupname] -- update group in database associated with groupname
router.put('/:groupname', (req, res) => {
	let data = req.body;
	let groupname = req.params.groupname;
	if (data.grouptitle) {
		pool.query('INSERT INTO groups(groupname,grouptitle) VALUES($1,$2) ON CONFLICT ON CONSTRAINT groups_pkey DO UPDATE SET grouptitle=EXCLUDED.grouptitle RETURNING *', [groupname, data.grouptitle], (err, result) => {
			if (err) {
				return res.status(500).send(err);
			}
			console.log(result);
			return res.status(200).json(result.rows[0]);
		});
	} else {
		return res.status(400).send('ERROR: "groupname" field must be included in request');
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
		if(result.rowCount === 0) {
			return res.status(404).send(`ERROR: group '${groupname}' not found`);
		}
		return res.status(200).send();
	});
});

module.exports = router;

