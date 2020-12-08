/* connect to elasticsearch production cluster instance on kubernetes */

var elasticsearch=require('elasticsearch');

var client = new elasticsearch.Client( {  
  hosts: [
    'http://localhost:9200'
  ]
});

module.exports = client;  
