/* connect to elasticsearch production cluster instance on kubernetes */

var elasticsearch=require('elasticsearch');

const HOST = process.env['ELASTICSEARCH_HOST'] || 'http://localhost:9200';

var client = new elasticsearch.Client( {
	hosts: [
		HOST
	]
});

module.exports = client;

