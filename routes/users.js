const express = require('express');
const router = express.Router();
const db = require('../index.js'); //FIXME: probably change this to wherever db was made

/**
 * Create new User given JSON
 */
router.post('/', (req, res) => {
    let data = req.body;

    //check JSON
    if (data.uid && data.email && data.name && data.info) {
        db.query('INSERT INTO users(uid,email,name,info) VALUES($1,$2,$3,$4) RETURNING *', [data.uid, data.email, data.name, data.ingo], (err, res) => {
            if (err) return res.status(500).send(err)
            return res.status(202).send(res.rows[0])
        })
    }
    res.status(400).send()//missing fields
})

/**
 * Update User given uid and JSON
 */
router.put('/:uid', (req, res) => {
    let data = req.body;
    let uid = req.params.uid;
    if (data.uid && data.email && data.name && data.info) {
        db.query('UPDATE users SET uid=$1,email=$2,name=$3,info=$4 WHERE uid = $5 RETURNING *', [data.uid, data.email, data.name, data.info, uid], (err, response) => {
            if (err) return res.status(500).send(err)
            return res.status(200).send(response.rows[0])
        })
    }
    res.status(400).send()//missing fields
})

/**
 * Get User given uid
 */
router.get('/:uid', (req, res, next) => {
    let uid = req.params.uid;
    db.query('SELECT * FROM users WHERE uid = $1', [uid], (err, response) => {
        if (err) return res.status(500).send(err)
        return res.status(200).send(res.rows[0])
    })
})

/**
 * Delete User given uid
 */
router.delete('/:uid', (req, res) => {
    let uid = req.params.uid;
    db.query('DELETE FROM users WHERE uid = $1', [uid], (err, response) => {
        if (err) return res.status(500).send(err)
        return res.status(200).send();
    })
})

module.exports = router;