/* Routes associated with querying a user's feed */

const express = require('express');
const router = express.Router();
let client = require('../utils/elastic/connection.js');


router.get('/', (req,res) => {
  if (req.query.q === undefined || req.query.q === null)
  {
    return res.status(501).send();
  }
  let search = req.query.q;
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
    if (error) {
    	console.log(error);
	return res.status(501).send();
    }
    if (elastic_res.hits === undefined)
    	return res.json([]);
    else
    	return res.json(elastic_res.hits.hits);
  });
});

module.exports = router;
