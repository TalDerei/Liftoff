/* Routes associated with querying a user's feed */

const express = require('express');
const router = express.Router();
let client = require('../utils/elastic/connection.js');


router.get('/', (req,res) => {
  let search = req.query.q;
  if (search == undefined || search == null)
    res.status(501).send();
  client.search({
    index: 'projects',
    body: {
      query: {
          multi_match: {
            "query": search,
            "fields": ["tags", "description", "title"],
          }
      }
    }
  },
  (error, elastic_res) => {
    if (err) {
    	console.log(error);
	res.status(501).send();
    }
    res.json(elastic_res.hits.hits[0]);

  });
});

module.exports = router;
