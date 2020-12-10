/* Testing Elastic Search and Kibana Cluster Health */

var client = require('./connection.js');

client.cluster.health({}, function(error,response,status) {  
  console.log("-- Client Health --", response);
});

// run -- 'curl -X GET 'http://localhost:9200/_cluster/stats?'
// run -- 'node test.js' and 'node create.js'
