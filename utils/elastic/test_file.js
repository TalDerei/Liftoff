/* Testing Elastic Search and Kibana Cluster Health */

var client = require('./connection.js');

client.cluster.health({},function(err,resp,status) {
	console.log("-- Client Health --",resp);
});

/* run -- 'curl -X GET 'http://localhost:9200/_cluster/stats?'
/* run -- 'node test_file.js' and 'node create.js'
