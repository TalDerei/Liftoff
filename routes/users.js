const express = require('express');
const router = express.Router();
const db = require('../index.js'); //FIXME: probably change this to wherever db was made

/**
 * Create new User given JSON
 */
router.post('/', (req, res) => {
    let data = req.body;

    //check JSON
    if (data.username && data.email && data.name) {
        db.query('INSERT INTO users(username,email,realname) VALUES($1,$2,$3) RETURNING *', [data.username, data.email, data.realname], (err, res) => {
            if (err) return res.status(500).send(err)
            return res.status(202).send(res.rows[0])
        })
    }
    res.status(400).send()//missing fields
})

/**
 * Update User given uid and JSON
 */
router.put('/:username', (req, res) => {
    let data = req.body;
    let username = req.params.username;
    if (data.email && data.realname) {
        db.query('UPDATE users SET email=$1,realname=$2, WHERE username = $3 RETURNING *', [data.email, data.realname, username], (err, response) => {
            if (err) return res.status(500).send(err)
            return res.status(200).send(response.rows[0])
        })
    }
    res.status(400).send()//missing fields
})

/**
 * Get User given uid
 */
router.get('/:username', (req, res, next) => {
    let username = req.params.username;
    db.query('SELECT * FROM users WHERE username = $1', [username], (err, response) => {
        if (err) return res.status(500).send(err)
        return res.status(200).send(res.rows[0])
    })
})

/**
 * Delete User given uid
 */
router.delete('/:username', (req, res) => {
    let username = req.params.username;
    db.query('DELETE FROM users WHERE username = $1', [username], (err, response) => {
        if (err) return res.status(500).send(err)
        return res.status(200).send();
    })
})

module.exports = router;