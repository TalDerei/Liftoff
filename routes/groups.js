/* routes associated with group */

const express = require('express');
const router = express.Router();

// use node-postgres module to create a pool of connections w/ environment variables stored off-repo
const Pool = require('pg').Pool;
const pool = new Pool();

// connect to database instance
pool.connect();

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
    return res.status(400).send();
});

// PUT /groups/[groupname] -- update group in database associated with groupname
router.put('/:groupname', (req, res) => {
    let data = req.body;
    let groupname = req.params.groupname;
    if (data.groupname && data.grouptitle) {
        pool.query('UPDATE groups SET groupname=$1,grouptitle=$2, WHERE groupname = $3 RETURNING *', [data.groupname, data.grouptitle], (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            return res.status(200).json(result.rows[0]);
        });
    }
    res.status(400).send();
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
    res.status(400).send();
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
    res.status(400).send();
});

module.exports = router;