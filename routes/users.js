/* routes associated with users */

const express = require('express');
const router = express.Router();

// use node-postgres module to create a pool of connections w/ environment variables stored off-repo
const Pool = require('pg').Pool;
const pool = new Pool();

// connect to database instance
pool.connect();

// POST /users -- create new user in database
router.post('/', (req, res) => {
    let data = req.body;
    if (data.username && data.email && data.real_name) {
        pool.query('INSERT INTO users(username,email,real_name) VALUES($1,$2,$3) RETURNING *', [data.username, data.email, data.real_name], (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            return res.status(202).json(result.rows[0]);
        });
    }
    return res.status(400).send();
});

// PUT /users/[username] -- update user in database associated with username
router.put('/:username', (req, res) => {
    let data = req.body;
    let username = req.params.username;
    if (data.email && data.real_name) {
        pool.query('UPDATE users SET email=$1,realname=$2, WHERE username = $3 RETURNING *', [data.email, data.real_name, username], (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            return res.status(200).json(result.rows[0]);
        });
    }
    res.status(400).send();
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
    res.status(400).send();
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
    res.status(400).send();
});

module.exports = router;