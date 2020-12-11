/* routes associated with group */

const express = require('express');
const passport = require('passport');
const pool = require('../utils/postgres');
const router = express.Router();

// GET /groups/[groupname] -- get group in database associated with groupname
router.get('/:groupname', (req, res, next) => {
	let groupname = req.params.groupname;
	pool.query('SELECT * FROM groups WHERE groupname = $1', [groupname], (err, result) => {
		if (err) {
			console.error('Error in GET /api/groups:', err);
			return res.status(500).send(err);
		}
		return res.status(200).json(result.rows[0]);
	});
});

// GET /groups/[groupname]/members/[username] -- get group membership in database
router.get('/:groupname/members/:username', (req, res, next) => {
	let groupname = req.params.groupname;
	let username = req.params.username;
	pool.query('SELECT * FROM group_membership WHERE groupname = $1 AND username = $2', [groupname,username], (err, result) => {
		if (err) {
			console.error('Error in GET /api/groups:', err);
			return res.status(500).send(err);
		}
		return res.status(200).json(result.rows[0]);
	});
});

// Declare authentication middleware:
router.use(passport.authenticate('jwt', { session: false }));

// POST /groups -- create new group in database
router.post('/', (req, res) => {
	let data = req.body;
	if (data.groupname && data.grouptitle) {
		pool.query('INSERT INTO groups(groupname,grouptitle) VALUES($1,$2) RETURNING *', [data.groupname, data.grouptitle], (err, result) => {
			if (err) {
				if(err.code === '23505') {
					return res.status(409).send(err.detail);
				}
				console.error('Error in POST /api/groups:', err);
				return res.status(500).send(err);
			}

			// Now, we need to insert the current user as the default administrator:
			pool.query('INSERT INTO group_membership(username,groupname,permission) VALUES($1,$2,\'Administrator\')', [req.user.username,groupname], (err) => {
				if (err) {
					console.error('Error in PUT /api/groups:', err);
					return res.status(500).send(err);
				}

				return res.status(202).json(result.rows[0]);
			});
		});
	} else {
		return res.status(400).send('ERROR: "groupname" and "grouptitle" fields must be included in request');
	}
});

// POST /groups/:group/members -- create new group member in database
router.post('/:groupname/members', (req, res) => {
	let groupname = req.params.groupname;
	let data = req.body;
	if (data.username && data.permission) {
		// Make sure the user has sufficient permission to operate on the group:
		pool.query('SELECT permission FROM group_membership WHERE username=$1 AND groupname=$2', [req.user.username,groupname], (err, result) => {
			if (err) {
				console.error('Error in PUT /api/groups:', err);
				return res.status(500).send(err);
			}

			// Check permission errors:
			if(result.rowCount !== 1 || result.rows[0].permission !== 'Administrator') {
				return res.status(403).send('ERROR: You must be an administrator to update a group\'s profile');
			}

			// Update the group membership:
			pool.query('INSERT INTO group_membership(groupname,username,permission) VALUES($1,$2,$3) RETURNING *', [groupname, data.username, data.permission], (err, result) => {
				if (err) {
					console.error('Error in POST /api/groups:', err);
					return res.status(500).send(err);
				}
				return res.status(200).send(result.rows[0]);
			});
		});
	} else {
		return res.status(400).send('ERROR: "username" and "permission" fields must be included in request');
	}
});

// PUT /groups/[groupname] -- update group in database associated with groupname
router.put('/:groupname', (req, res) => {
	const data = req.body;
	const groupname = req.params.groupname;

	// IMPORTANT: [Buckley Ross]: This next section has the potential to cause a data-race if we're not careful.
	//	It'll work well enough for our demo, but we really need to move all of this logic out to a stored procedure
	//	before we release this to the public.
	if (data.grouptitle) {
		// First, check whether or not the group exists:
		pool.query('SELECT COUNT(*) FROM groups WHERE groupname=$1', [ groupname ], (err, result) => {
			if (err) {
				console.error('Error in PUT /api/groups:', err);
				return res.status(500).send(err);
			}

			if(result.rows[0].count === '0') {
				// The group was not found; time to insert it:
				pool.query('INSERT INTO groups(groupname,grouptitle) VALUES($1,$2) RETURNING *', [groupname, data.grouptitle], (err, resutlt) => {
					if (err) {
						console.error('Error in PUT /api/groups:', err);
						return res.status(500).send(err);
					}

					// Now, we need to insert the current user as the default administrator:
					pool.query('INSERT INTO group_membership(username,groupname,permission) VALUES($1,$2,\'Administrator\')', [req.user.username,groupname], (err) => {
						if (err) {
							console.error('Error in PUT /api/groups:', err);
							return res.status(500).send(err);
						}

						return res.status(202).json(result.rows[0]);
					});
				});
			} else {
				// The group was found; we need to make sure the user has sufficient permission to operate on the group:
				pool.query('SELECT permission FROM group_membership WHERE username=$1 AND groupname=$2', [req.user.username,groupname], (err, result) => {
					if (err) {
						console.error('Error in PUT /api/groups:', err);
						return res.status(500).send(err);
					}

					// Check permission errors:
					if(result.rowCount !== 1 || result.rows[0].permission !== 'Administrator') {
						return res.status(403).send('ERROR: You must be an administrator to update a group\'s profile');
					}

					// Update the group:
					pool.query('UPDATE groups SET grouptitle=$1 WHERE groupname=$2 RETURNING *', [groupname, data.grouptitle], (err, result) => {
						if (err) {
							console.error('Error in PUT /api/groups:', err);
							return res.status(500).send(err);
						}
						return res.status(200).send(result.rows[0]);
					});
				});
			}
		});
	} else {
		return res.status(400).send('ERROR: "grouptitle" field must be included in request');
	}
});

// PUT /groups/:group/members -- upsert group member in database
router.put('/:groupname/members/:username', (req, res) => {
	let groupname = req.params.groupname;
	let username = req.params.username;
	let data = req.body;
	if (data.permission) {
		// Make sure the user has sufficient permission to operate on the group:
		pool.query('SELECT permission FROM group_membership WHERE username=$1 AND groupname=$2', [req.user.username,groupname], (err, result) => {
			if (err) {
				console.error('Error in PUT /api/groups:', err);
				return res.status(500).send(err);
			}

			// Check permission errors:
			if(result.rowCount !== 1 || result.rows[0].permission !== 'Administrator') {
				return res.status(403).send('ERROR: You must be an administrator to update a group\'s profile');
			}

			// Update the group membership:
			pool.query('INSERT INTO group_membership(groupname,username,permission) VALUES($1,$2,$3) ON CONFLICT ON CONSTRAINT group_membership_pkey DO UPDATE SET permission=$3 RETURNING *', [groupname, username, data.permission], (err, result) => {
				if (err) {
					console.error('Error in PUT /api/groups:', err);
					return res.status(500).send(err);
				}
				return res.status(200).send(result.rows[0]);
			});
		});
	} else {
		return res.status(400).send('ERROR: "permission" fields must be included in request');
	}
});

// DELETE /groups/[groupname] -- delete group in database associated with groupname
router.delete('/:groupname', (req, res) => {
	let groupname = req.params.groupname;

	// Make sure the user has sufficient permission to operate on the group:
	pool.query('SELECT permission FROM group_membership WHERE username=$1 AND groupname=$2', [req.user.username,groupname], (err, result) => {
		if (err) {
			console.error('Error in DELETE /api/groups:', err);
			return res.status(500).send(err);
		}

		// Check permission errors:
		if(result.rowCount !== 1 || result.rows[0].permission !== 'Administrator') {
			return res.status(403).send('ERROR: You must be an administrator to update a group\'s profile');
		}

		// Delete the group:
		pool.query('DELETE FROM groups WHERE groupname = $1', [groupname], (err, result) => {
			if (err) {
				console.error('Error in DELETE /api/groups:', err);
				return res.status(500).send(err);
			}
			if(result.rowCount === 0) {
				return res.status(404).send(`ERROR: group '${groupname}' not found`);
			}
			return res.status(200).send();
		});
	});
});

// DELETE /groups/:group/members -- delete group member in database
router.delete('/:groupname/members/:username', (req, res) => {
	let groupname = req.params.groupname;
	let username = req.params.username;
	// Make sure the user has sufficient permission to operate on the group:
	pool.query('SELECT permission FROM group_membership WHERE username=$1 AND groupname=$2', [req.user.username,groupname], (err, result) => {
		if (err) {
			console.error('Error in PUT /api/groups:', err);
			return res.status(500).send(err);
		}

		// Check permission errors:
		if(result.rowCount !== 1 || result.rows[0].permission !== 'Administrator') {
			return res.status(403).send('ERROR: You must be an administrator to update a group\'s profile');
		}

		// Update the group membership:
		pool.query('DELETE FROM group_membership WHERE groupname=$1 AND username=$2', [groupname, username], (err, result) => {
			if (err) {
				console.error('Error in DELETE /api/groups:', err);
				return res.status(500).send(err);
			}
			return res.status(200).send();
		});
	});
});


module.exports = router;

